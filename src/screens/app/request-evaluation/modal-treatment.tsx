import React from 'react';
import { Linking, StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Colors from 'utils/colors';
import Close from 'assets/icons/close.png';
import Button from 'widgets/button';
import { TextInput } from 'widgets';
import RightCarousel from 'assets/icons/right-carousel.png';
import LeftCarousel from 'assets/icons/left-carousel.png';
import Video from 'react-native-video';
import ProgressBar from "react-native-progress/Bar";
import Icon from "react-native-vector-icons/FontAwesome";
import Poster from 'assets/images/poster.jpg';
import { showAlert } from 'utils';

const secondsToTime = (time: number) => {
  return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
}

class ModalTreatment extends React.Component<any> {

	public player: any;
	public progressBar: any;

	state = {
		form: {
			message: ''
		},
		selected: 0,
		paused: true,
        progress: 0,
        duration: 0,
        play: false
	}

	submit = () => {
		if (this.state.form.message == '') {
			showAlert('Alerta', 'Debe ingresar un mensaje');
		}
		else {
			let text: string = "";
			text += 'Tratamiento: ' + this.props.treatment.name + '\n';
			text += this.state.form.message;
			Linking.openURL(`whatsapp://send?text=${ text }&phone=${ this.props.contact.phone }`);
			this.props.onBack();
		}		
	}

	handleMainButtonTouch = () => {
	    if (this.state.progress >= 1) {
	      this.player.seek(0);
	    }

	    this.setState({
	      	play: true,
	        paused: !this.state.paused,
	    });
	}

	handleProgressPress = e => {
	    const position = e.nativeEvent.locationX;
	    const progress = (position / this.progressBar.props.width) * this.state.duration;
	    const isPlaying = !this.state.paused;
	    
	    this.player.seek(progress);
	}

	handleProgress = (progress: any) => {
	    this.setState({
	      progress: progress.currentTime / this.state.duration,
	    });
	}

	handleEnd = () => {
	    this.setState({ paused: true });
	}

	handleLoad = (meta: any) => {
	    this.setState({
	      duration: meta.duration,
	    });
	}
	
	render() {
		const file_selected = this.props.treatment.files[this.state.selected];
		const video_formats = ['mkv','flv','mp4','avi','wmv','mov','mpg'];
		const image_formats = ['jpg','jpeg','png'];
		const isVideo = file_selected && video_formats.indexOf(file_selected.file_url.split('.').pop()) != -1;
		const isImage = file_selected && image_formats.indexOf(file_selected.file_url.split('.').pop()) != -1;
		
		return (
			<View style={ styles.container }>
				<TouchableOpacity onPress={ this.props.onBack }>
					<View style={ styles.close }>
						<Image source={ Close } style={ styles.closeImage } />
					</View>
				</TouchableOpacity>
				<ScrollView style={ { flex: 1 } } keyboardShouldPersistTaps="always">
					<View style={ { padding: 20, paddingTop: 0 } }>			
						<Text numberOfLines={ 1 } style={ styles.title }>{ this.props.treatment.name }</Text>
						<Text numberOfLines={ 5 } style={ styles.subtitle }>{ this.props.treatment.description }</Text>
						{
							isVideo && (
								<View style={ {
									width: '100%',
			                        height: 200,
			                        marginTop: 10,
			                        backgroundColor: 'black'
								} }>
									<TouchableWithoutFeedback onPress={ this.handleMainButtonTouch }>
										<Video
											paused={ this.state.paused }
											resizeMode="contain"
								            onLoad={ this.handleLoad }
								            onProgress={ this.handleProgress }
								            onEnd={ this.handleEnd }
								            ref={ ref => {
								              this.player = ref;
								            } }
											style={ {
						                        width: '100%',
			                        			height: this.state.play ? 150 : 0
						                    } }  
											source={ { uri: file_selected.file_url } } />
									</TouchableWithoutFeedback>
									{
										!this.state.play && (
											<TouchableWithoutFeedback onPress={ this.handleMainButtonTouch }>
												<Image
													style={ {
														height: 150,
														width: '100%',
														resizeMode: 'cover'
													} }
													source={ Poster } />
											</TouchableWithoutFeedback>
										)
									}										
									<View style={ styles.controls }>
							            <TouchableWithoutFeedback onPress={ this.handleMainButtonTouch }>
							              <Icon name={ !this.state.paused ? "pause" : "play" } size={ 30 } color="#fff" />
							            </TouchableWithoutFeedback>
							            <TouchableWithoutFeedback onPress={ this.handleProgressPress }>
							              <View>
							                <ProgressBar
							                  ref={ (ref: any) => this.progressBar = ref }
							                  progress={ this.state.progress }
							                  color="#fff"
							                  unfilledColor="rgba(255,255,255,.5)"
							                  borderColor="#fff"
							                  height={ 20 }
							                />
							              </View>
							            </TouchableWithoutFeedback>
							            <Text style={ styles.duration }>
							              { secondsToTime(Math.floor(this.state.progress * this.state.duration)) }
							            </Text>
							        </View>
								</View>
							)
						}
						{
							isImage && (
								<Image
									style={ {
											width: '100%',
											height: 200,
											marginTop: 10,
											resizeMode: 'cover'
									} }
									source={ { uri: file_selected.file_url } }
								/>
							)
						}
						<View style={ { flexDirection: 'row', paddingVertical: 20 } }>
							<View style={ { flex: .1 } }>
								<TouchableOpacity onPress={ () => {
									if (this.state.selected > 0) {
										this.setState({
											selected: this.state.selected - 1,
											paused: true,
									        progress: 0,
									        duration: 0,
									        play: false
										});
									}
								} }>
									<Image source={ LeftCarousel } style={ styles.carouselIcon } />
								</TouchableOpacity>
							</View>
							<View style={ { flex: .8 } }>
								<View style={ styles.containerIndicators }>
									{
										this.props.treatment.files.map((i: any,index: number) => (
											<View style={ [styles.indicator,index == this.state.selected ? {
												backgroundColor: Colors.yellow
											} : null] } />
										))
									}
								</View>
							</View>
							<View style={ { flex: .1 } }>
								<TouchableOpacity onPress={ () => {
									if ((this.state.selected + 1) < this.props.treatment.files.length) {
										this.setState({
											selected: this.state.selected + 1,
											paused: true,
									        progress: 0,
									        duration: 0,
									        play: false
										});
									}
								} }>
									<Image source={ RightCarousel } style={ styles.carouselIcon } />
								</TouchableOpacity>
							</View>
						</View>
						<TextInput
				          multiline
				          numberOfLines={5}
				          onChangeText={ (data: string) => this.setState({
				          	form: {
				          		...this.state.form,
				          		message: data
				          	}
				          }) }
				          placeholder="Mensaje"
				          textAlignVertical="top"
				          value={ this.state.form.message }
				          style={ styles.textarea }
				        />
						<View
		                  style={ {
		                    padding: 16,
		                    alignItems: 'center',
		                  } }>
							<Button
			                    style={ styles.button }
			                    titleStyle={ styles.buttonTitle }
			                    title="Ir al Whatsapp"
			                    onPress={ this.submit }
			                    textBold
			                />
			            </View>
		            </View>
		        </ScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.gray4,
		maxHeight: Dimensions.get('window').height * 0.8,
		flex: 1
	},
	close: {
		alignSelf: 'flex-end',
		flexDirection: 'row',
		padding: 20,
		paddingBottom: 10
	},
	closeImage: {
		width: 15,
		height: 15,
		resizeMode: 'contain',
		tintColor: Colors.yellow
	},
	button: {
	    backgroundColor: Colors.yellow,
	    borderRadius: 100,
	    margin: 5,
	    paddingHorizontal: 16,
	    paddingVertical: 8,
	},
	buttonTitle: {
	    color: 'white',
	},
	title: {
		color: Colors.yellow,
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 15,
		marginVertical: 10
	},
	subtitle: {
		color: Colors.white,
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 14,
		marginBottom: 5
	},
	textarea: {
	    minHeight: 50,
	},
	carouselIcon: {
		width: 30,
		height: 30,
		resizeMode: 'contain'
	},
	indicator: {
		width: 7,
		height: 7,
		borderRadius: 3.5,
		backgroundColor: Colors.gray2,
		marginHorizontal: 2
	},
	containerIndicators: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 10
	},
	controls: {
	    backgroundColor: "rgba(0, 0, 0, 0.5)",
	    height: 48,
	    left: 0,
	    bottom: 0,
	    right: 0,
	    position: "absolute",
	    flexDirection: "row",
	    alignItems: "center",
	    justifyContent: "space-around",
	    paddingHorizontal: 10,
	},
	mainButton: {
	    marginRight: 15,
	},
	duration: {
	    color: "#FFF",
	    marginLeft: 15,
	}
});

export default ModalTreatment;