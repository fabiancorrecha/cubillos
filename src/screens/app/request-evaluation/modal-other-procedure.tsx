import React from 'react';
import { Linking, StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import Colors from 'utils/colors';
import Close from 'assets/icons/close.png';
import Button from 'widgets/button';
import { TextInput } from 'widgets';
import { showAlert } from 'utils';

class ModalOtherProcedure extends React.Component<any> {

	state = {
		form: {
			message: ''
		}
	}

	submit = () => {
		if (this.state.form.message == '') {
			showAlert('Alerta', 'Debe ingresar un mensaje');
		}
		else {
			let text: string = "";
			text += this.state.form.message;
			Linking.openURL(`whatsapp://send?text=${ text }&phone=${ this.props.contact.phone }`);
			this.props.onBack();
		}
	}
	
	render() {
		return (
			<View style={ styles.container }>
				<TouchableOpacity onPress={ this.props.onBack }>
					<View style={ styles.close }>
						<Image source={ Close } style={ styles.closeImage } />
					</View>
				</TouchableOpacity>
				<ScrollView style={ { flex: 1 } } keyboardShouldPersistTaps="always">
					<View style={ { padding: 20, paddingTop: 0 } }>						
						<Text numberOfLines={ 1 } style={ styles.title }>Otro procedimiento</Text>
						<Text numberOfLines={ 5 } style={ styles.subtitle }>Indique la operación que quiere realizarse</Text>
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
		minHeight: 330
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
	    minHeight: 80,
	}
});

export default ModalOtherProcedure;