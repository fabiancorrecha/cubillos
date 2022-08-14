import React, { ReactElement } from 'react';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { SafeAreaView, View, StyleSheet, ActivityIndicator, Text, ScrollView, Image, TouchableOpacity, Keyboard } from 'react-native';
import Button from 'widgets/button';
import Colors from 'utils/colors';
import LoadingContainer from 'widgets/loading-container';
import GradientContainer from 'widgets/gradient-container';
import { TextInput, Picker } from 'widgets';
import { ModeratorService } from 'services/admin';
import Toast from 'react-native-root-toast';
import { emit } from 'jetemit';
import { Icons } from 'assets/icons';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class CreateEditModerator extends React.Component<Props> {

	state = {
		countries: this.props.navigation.getParam('countries').map((i: any) => {
			return {
				value: i.id,
				label: i.name
			}
		}),
		permissions: this.props.navigation.getParam('permissions').map((i: any) => {
			i.selected = false;
			const item: any = this.props.navigation.getParam('moderator');
			if (item && item.permissions.map((i: any) => i.id).indexOf(i.id) != -1) {
				i.selected = true;
			}
			return i;
		}),
		form: {
			name: '',
			lastname: '',
			country: {
				value: '',
				label: 'Seleccione'
			},
			address: '',
			phone: '',
			email: '',
			id: null,
			password: '',
			password_confirmation: ''
		},
		loading: false
	}

	componentDidMount() {
		if (this.props.navigation.getParam('moderator')) {
			const moderator: any = this.props.navigation.getParam('moderator');
			this.setState({
				form: {
					...this.state.form,
					name: moderator.person.name,
					lastname: moderator.person.lastname,
					address: moderator.person.address,
					country: {
						value: moderator.person.country.id,
						label: moderator.person.country.name
					},
					phone: moderator.person.phone,
					email: moderator.email,
					id: moderator.id
				}
			});
		}
	}

	submit = async () => {
		Keyboard.dismiss();
		await this.setState({
			loading: true
		});
		let data: any = { ...this.state.form };
		data.country_id = data.country.value;
		data.permissions = this.state.permissions.filter((i: any) => i.selected).map((i: any) => i.id);
		const res: any = await ModeratorService[this.props.navigation.getParam('moderator') ? 'edit' : 'create'](data,() => {
			this.setState({
				loading: false
			});
		});
		Toast.show("Se han guardado los cambios correctamente");
		this.props.navigation.goBack(null);
		if (this.props.navigation.getParam('moderator'))
			emit('moderators/edit',res.moderator);
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
		const permissions: any = [ ...this.state.permissions ];
		permissions[index].selected = !permissions[index].selected;
		this.setState({
			permissions
		});
	}
	
	render() {
		return (
			<SafeAreaView style={ { flex: 1 } }>
				<GradientContainer style={ styles.container }>
					<ScrollView keyboardShouldPersistTaps="always">
						<View>
							<Text style={ styles.bold }>Nombre</Text>
							<TextInput
				              onChangeText={ (e: any) => this.change(e,'name') }
				              placeholder="Nombre"
				              value={ this.state.form.name }
				            />
						</View>
						<View>
							<Text style={ styles.bold }>Apellido</Text>
							<TextInput
				              onChangeText={ (e: any) => this.change(e,'lastname') }
				              placeholder="Apellido"
				              value={ this.state.form.lastname }
				            />
						</View>
						<View>
							<Text style={ styles.bold }>Correo Electrónico</Text>
							<TextInput
				              onChangeText={ (e: any) => this.change(e,'email') }
				              placeholder="Correo Electrónico"
				              value={ this.state.form.email }
				            />
						</View>
						<View>
							<Text style={ styles.bold }>Teléfono</Text>
							<TextInput
							  keyboardType="phone-pad"
				              onChangeText={ (e: any) => this.change(e,'phone') }
				              placeholder="Teléfono"
				              value={ this.state.form.phone }
				            />
						</View>
						<View>
							<Text style={ styles.bold }>Dirección</Text>
							<TextInput
							  style={ styles.textArea }
						      numberOfLines={ 5 }
							  multiline={ true }
				              onChangeText={ (e: any) => this.change(e,'address') }
				              placeholder="Dirección"
				              value={ this.state.form.address }
				            />
						</View>
						<View>
							<Text style={ styles.bold }>País</Text>
							<Picker
				              displayValue={ this.state.form.country.label }
				              onValueChange={ (e: any) => {
				              	if (e != '') {
				              		const value = this.state.countries.find((i: any) => i.value == e);
				              		this.change(value,'country');
				              	}			              	
				              } }
				              selectedValue={ this.state.form.country.value }>
				              <Picker.Item
				                  value={ '' }
				                  label={ 'Seleccione' }
				              />
				              {/* */}
				              { this.state.countries.map((i: any) => (
				                <Picker.Item
				                  key={ i.value.toString() }
				                  value={ i.value }
				                  label={ i.label }
				                />
				              )) }
				            </Picker>
						</View>
						{
							!this.props.navigation.getParam('moderator') && (
								<React.Fragment>
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
								</React.Fragment>
							)
						}
						<Text style={ { color: Colors.white, marginBottom: 10, fontWeight: 'bold' } }>Permisos:</Text>
						{
							this.props.navigation.getParam('permissions').map((i: any, index: number) => (
								<TouchableOpacity onPress={ () => this.changeCheck(index) }>
					            	<View style={ { flexDirection: 'row', marginVertical: 7 } }>
					            		<Image 
					            			style={ styles.itemCheckBox }
					            			source={ i.selected ? Icons.checkBoxChecked : Icons.checkBoxIdle } />
					            		<Text style={ { color: Colors.white } }>{ i.name }</Text>
					            	</View>
					            </TouchableOpacity>
							))
						}
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
	yellowButton: {
	    backgroundColor: Colors.yellow,
	},
	whiteTitle: {
	    color: Colors.white,
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
	textArea: {
	    minHeight: 100,
	},
	itemCheckBox: {
	    height: 24,
	    tintColor: Colors.white,
	    width: 24,
	    marginEnd: 8,
	}
});

export default CreateEditModerator;