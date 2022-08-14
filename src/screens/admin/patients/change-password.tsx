import React, { ReactElement } from 'react';
import LoadingContainer from 'widgets/loading-container';
import { PatientService } from 'services/admin';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { TextInput } from 'widgets';
import { SafeAreaView, View, StyleSheet, Text, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import Button from 'widgets/button';
import Colors from 'utils/colors';
import GradientContainer from 'widgets/gradient-container';
import Toast from 'react-native-root-toast';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class ChangePasswordPatient extends React.Component<Props> {

	state = {
		form: {
			password: '',
			password_confirmation: ''
		}, 
		loading: false
	}

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}

	submit = async () => {
		Keyboard.dismiss();
		await this.setState({
			loading: true
		});
		let params: any = { ...this.state.form };
		params.id = this.props.navigation.getParam('patient').id;
		await PatientService.changePass(params,() => {
			this.setState({
				loading: false
			});
		});
		Toast.show("Se ha cambiado correctamente la contraseña");
		this.props.navigation.goBack(null);
	}
	
	render() {
		return (
			<SafeAreaView style={ { flex: 1 } }>
				<GradientContainer style={ styles.container }>
					<ScrollView keyboardShouldPersistTaps="always">
						<View>
							<Text style={ styles.bold }>Nueva Contraseña</Text>
							<TextInput
							  secureTextEntry
				              onChangeText={ (e: any) => this.change(e,'password') }
				              value={ this.state.form.password }
				            />
						</View>
						<View>
							<Text style={ styles.bold }>Repetir Contraseña</Text>
							<TextInput
							  secureTextEntry
				              onChangeText={ (e: any) => this.change(e,'password_confirmation') }
				              value={ this.state.form.password_confirmation }
				            />
						</View>
						<ButtonsContainer onBack={ () => this.props.navigation.goBack(null) }>
				          { this.state.loading ? (
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
					</ScrollView>
				</GradientContainer>
			</SafeAreaView>
		)
	}
}

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
      <View style={ { flexDirection: 'row', alignItems: 'center' } }>
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

const styles = StyleSheet.create({
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
	container: {
	    height: '100%',
	    paddingHorizontal: 15,
	    paddingVertical: 15,
	},
	bold: {
		color: Colors.white,
		fontWeight: 'bold'
	},
	yellowButton: {
	    backgroundColor: Colors.yellow,
	},
	whiteTitle: {
	    color: Colors.white,
	    textAlign: 'center',
	},
});

export default ChangePasswordPatient;