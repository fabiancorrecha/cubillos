import React, { ReactElement } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Keyboard, Image, ScrollView } from 'react-native';
import { TextInput } from 'widgets';
import { ProcedureService } from 'services/admin';
import LoadingContainer from 'widgets/loading-container';
import Colors from 'utils/colors';
import GradientContainer from 'widgets/gradient-container';
import Button from 'widgets/button';
import Toast from 'react-native-root-toast';
import { emit } from 'jetemit';
import { socket } from 'services/socket';
import { openImagePicker } from 'utils';
import Photo from 'assets/images/photo.png';
import { PUBLIC_URL } from 'react-native-dotenv';
import { SentPhoto } from 'models/sent-photo';
import { Icons } from 'assets/icons';

class CreateEditProcedure extends React.Component<any> {

	state = {
		form: {
			name: '',
			description: '',
			id: null,
			icon: null
		},
		image: '',
		loading: false,
		loadingSubmit: false,
		typePhotos: []
	}

	componentDidMount() {
		const procedure = this.props.navigation.getParam('procedure');
		if (procedure) {
			this.setState({
				form: {
					name: procedure.name,
					description: procedure.description,
					id: procedure.id,
					icon: null
				},
				image: procedure.icon ? PUBLIC_URL + 'storage/' + procedure.icon : ''
			})
		}

		let typePhotos = this.props.navigation.getParam('photos');
		if (typePhotos) {
			typePhotos.map((i: any) => {
				i.selected = false;
				const item: any = this.props.navigation.getParam('procedure');
				if (item && item.photos.map((i: any) => i.id).indexOf(i.id) != -1) {
					i.selected = true;
				}
				return i;
			});
			this.setState({
				typePhotos
			});
		}
	}

	selectIcon = () => {
		openImagePicker()
	      .then((uri: string) => {
			this.setState({
				image: uri,
				form: {
					...this.state.form,
					icon: uri
				}				
			});
	      })
	      .catch((err: any) => console.log(err));
	}

	submit = async () => {
		Keyboard.dismiss();
		await this.setState({
			loadingSubmit: true
		});
		let data: any = { ...this.state.form };
		if (data.icon) {
			data.file = SentPhoto.toFile({ uri: data.icon, rotation: 0 });
		}
		data.photos = [
			...this.state.typePhotos
				.filter((i: any) => i.selected == true)
				.map((i: any) => i.id)
		];
		const res: any = await ProcedureService[this.props.navigation.getParam('procedure') ? 'edit' : 'create'](data,() => {
			this.setState({
				loadingSubmit: false
			});
		});;
		this.props.navigation.goBack(null);
		emit('procedures/save',this.state.form);
		Toast.show("Se ha guardado correctamente el procedimiento");
		socket.emit('procedures/change',res.procedures);
	}

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}

	changeCheck = (index: number) => {
		let photos: any = [ ...this.state.typePhotos ];
		photos[index].selected = !photos[index].selected;
		this.setState({
			typePhotos: photos
		});
	}
	
	render() {
		return (
			<SafeAreaView style={ { flex: 1 } }>
				<ScrollView keyboardShouldPersistTaps="always">
					<GradientContainer style={ styles.container }>					
						<TouchableOpacity onPress={ this.selectIcon }>
							<Image source={ this.state.image != '' ? { uri: this.state.image } : Photo } style={ styles.image } />
						</TouchableOpacity>
						<Text style={ styles.title }>
			              { this.props.navigation.getParam('procedure') ? 'Editar Procedimiento' : 'Nuevo Procedimiento' } 
			            </Text>
						<TextInput
			              onChangeText={ (e: any) => this.change(e,'name') }
			              placeholder="Nombre"
			              value={ this.state.form.name }
			            />
			            <TextInput
			              multiline={ true }
			              onChangeText={ (e: any) => this.change(e,'description') }
			              placeholder="Descripción"
			              style={ styles.textArea }
			              value={ this.state.form.description }
			              numberOfLines={5}
			            />
			            <Text style={ { color: Colors.white, marginBottom: 10, fontWeight: 'bold' } }>Tipos de Fotos:</Text>
			            {
			            	this.state.typePhotos.map((i: any, index: number) => (
								<TouchableOpacity onPress={ () => this.changeCheck(index) }>
					            	<View style={ { flexDirection: 'row', marginVertical: 7 } }>
					            		<Image 
					            			style={ styles.itemCheckBox }
					            			source={ i.selected ? Icons.checkBoxChecked : Icons.checkBoxIdle } />
					            		<Text style={ { color: Colors.white } }>{ i.name + (i.description ? (' (' + i.description + ')') : '') }</Text>
					            	</View>
					            </TouchableOpacity>
			            	))
			            }
			            <LoadingContainer loading={ this.state.loading }>
			            	<ButtonsContainer onBack={ () => this.props.navigation.goBack(null) }>
					          { this.state.loadingSubmit ? (
					            <ActivityIndicator color="white" />
					          ) : (
					            <Button
					              style={ [ styles.button, styles.yellowButton ] }
					              titleStyle={ styles.whiteTitle }
					              title="Guardar"
					              onPress={ this.submit }
					            />
					          )}
					        </ButtonsContainer>
			            </LoadingContainer>				    	         
					</GradientContainer>
				</ScrollView> 
			</SafeAreaView>
		)
	}	
}

const styles = StyleSheet.create({
	textArea: {
	    minHeight: 100,
	},
	container: {
	    height: '100%',
	    paddingHorizontal: 15,
	    paddingVertical: 15,
	},
	button: {
	    width: '90%',
	    marginTop: 5,
	    padding: 8,
	    borderRadius: 30,
	    alignSelf: 'center',
	},
	whiteButton: {
	    backgroundColor: Colors.white,
	},
	yellowTitle: {
	    color: Colors.yellow,
	    textAlign: 'center',
	},
	yellowButton: {
	    backgroundColor: Colors.yellow,
	},
	whiteTitle: {
	    color: Colors.white,
	    textAlign: 'center',
	},
	title: {
	    color: Colors.yellow,
	    fontSize: 18,
	    marginBottom: 12,
	    textAlign: 'center',
	    fontWeight: 'bold'
	},
	image: {
		height: 100,
		width: 100,
		borderRadius: 50,
		alignSelf: 'center',
		marginVertical: 15,
		resizeMode: 'cover'
	},
	itemCheckBox: {
	    height: 24,
	    tintColor: Colors.white,
	    width: 24,
	    marginEnd: 8,
	}
});

interface ButtonsContainerProps {
  onBack?: () => void;
  children: React.ReactNode;
}

const ButtonsContainer = ({
  onBack,
  children,
}: ButtonsContainerProps): ReactElement => {
  if (onBack) {
    return (
      <View style={ { flexDirection: 'row', alignItems: 'center', marginTop: 20 } }>
        <View style={ { flex: 0.5 } }>
          <Button
            onPress={ onBack }
            style={ [ styles.button, styles.whiteButton ] }
            titleStyle={ styles.yellowTitle }
            title="Volver"
          />
        </View>
        <View style={ { flex: 0.5, justifyContent: 'center' } }>{ children }</View>
      </View>
    )
  }

  return (
  	<React.Fragment>
  		{ children }
  	</React.Fragment>
  )
}

export default CreateEditProcedure;