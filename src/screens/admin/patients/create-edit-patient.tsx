import React, { ReactElement } from 'react';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { SafeAreaView, TouchableWithoutFeedback, View, StyleSheet, ActivityIndicator, Text, ScrollView, Image, TouchableOpacity, Platform, Keyboard } from 'react-native';
import Button from 'widgets/button';
import Colors from 'utils/colors';
import LoadingContainer from 'widgets/loading-container';
import GradientContainer from 'widgets/gradient-container';
import { TextInput, Picker } from 'widgets';
import { PatientService, PatientDataService } from 'services/admin';
import Toast from 'react-native-root-toast';
import { emit } from 'jetemit';
import { Icons } from 'assets/icons';
import moment from 'moment';
import ModalContainerIOS from 'widgets/modal-container-ios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { socket } from 'services/socket';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class CreateEditPatient extends React.Component<Props> {

	state = {
		countries: this.props.navigation.getParam('countries').map((i: any) => {
			return {
				value: i.id,
				label: i.name
			}
		}),
		document_types: this.props.navigation.getParam('document_types').map((i: any) => {
			return {
				value: i.id,
				label: i.name
			}
		}),
		genders: [
			{ value: 'M', label: 'M' },
			{ value: 'F', label: 'F' }
		],
		showDatePicker: false,
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
		loading: false,
		tab: 1, 
		loadingData: false,
		formData: {
			birthdate: '',
			document_type_id: {
				value: '',
				label: 'Seleccione'
			},
			document: '',
			gender: {
				value: '',
				label: 'Seleccione'
			},
			marital_status: '',
			occupation: '',
			residence: '',
			responsable: '',
			responsable_relationship: '',
			responsable_phone: '',
			companion: '',
			companion_phone: '',
			insurance: '',
			type_union: '',
			city: '',
			previous_procedures: '',
	        medicines: '',
	        allergies: '',
	        diseases: ''
		}
	}

	onUserDeleted = (userId: number) => {
		const {navigation} = this.props;

		if (navigation.getParam('patient')?.id === userId) {
			Toast.show('Este paciente ha sido eliminado');
			navigation.goBack();
		}
	};

	componentDidMount() {
		socket.on('patients/user-delete', this.onUserDeleted);

		if (this.props.navigation.getParam('patient')) {
			const patient: any = this.props.navigation.getParam('patient');
			const item: any = patient.data || {};
			this.setState({
				form: {
					...this.state.form,
					name: patient.person.name,
					lastname: patient.person.lastname,
					address: patient.person.address,
					country: {
						value: patient.person.country.id,
						label: patient.person.country.name
					},
					phone: patient.person.phone,
					email: patient.email,
					id: patient.id
				},
				formData: {
					birthdate: item.birthdate ? moment(item.birthdate).format('DD/MM/YYYY') : '',
					document_type_id: {
						value: item.document_type_id || '',
						label: item.document_type_id ? 
							   this.state.document_types.find((i: any) => i.value == item.document_type_id).label 
							   : 'Seleccione'
					},
					document: item.document || '',
					gender: {
						value: item.gender || '',
						label: item.gender || 'Seleccione',
					},
					marital_status: item.marital_status || '',
					occupation: item.occupation || '',
					residence: item.residence || '',
					responsable: item.responsable || '',
					responsable_relationship: item.responsable_relationship || '',
					responsable_phone: item.responsable_phone || '',
					companion: item.companion || '',
					companion_phone: item.companion_phone || '',
					insurance: item.insurance || '',
					type_union: item.type_union || '',
					city: item.city || '',
					previous_procedures: item.previous_procedures || '',
			        medicines: item.medicines || '',
			        allergies: item.allergies || '',
			        diseases: item.diseases || ''
				}
			});
		}
	}

	componentWillUnmount(): void {
		socket.removeListener('patients/user-delete', this.onUserDeleted);
	}

	submit = async () => {
		Keyboard.dismiss();
		await this.setState({
			loading: true
		});
		let data: any = { ...this.state.form };
		data.country_id = data.country.value;
		const res: any = await PatientService[this.props.navigation.getParam('patient') ? 'edit' : 'create'](data,() => {
			this.setState({
				loading: false
			});
		});
		Toast.show("Se han guardado los cambios correctamente");
		this.props.navigation.goBack(null);
		if (this.props.navigation.getParam('patient'))
			emit('patients/edit',res.patient);
	}

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}

	changeData = (e: any, name: string) => {
		this.setState({
			formData: {
				...this.state.formData,
				[name]: e
			}
        });
	}

	submitData = async () => {
		Keyboard.dismiss();
		await this.setState({
			loadingData: true
		});
		let data: any = { ...this.state.formData };
		data.id = this.props.navigation.getParam('patient').id;
		data.birthdate = data.birthdate ? moment(data.birthdate,'DD/MM/YYYY').format('YYYY-MM-DD') : null;
		data.document_type_id = data.document_type_id.value;
		data.gender = data.gender.value;
		const res: any = await PatientDataService.save(data,() => {
			this.setState({
				loadingData: false
			});
		});
		Toast.show("Se ha guardado correctamente los datos del paciente");
		this.props.navigation.goBack(null);
		if (this.props.navigation.getParam('patient'))
			emit('patients/edit',res.patient);
	}

	changeBirthdate = (newDate: string): void => {
		if (Platform.OS == 'ios') {
			Keyboard.dismiss();
		}
		if (moment().diff(moment(newDate, 'DD/MM/YYYY'), 'years') < 18) {
			Toast.show('Solo apto para mayores de 18 años');
		} else {
			this.changeData(newDate, 'birthdate')
		}
	};
	
	render() {
		const { tab } = this.state;
		const setTab = (tab: number) => {
			this.setState({
				tab
			});
		}

		return (
			<SafeAreaView style={ { flex: 1 } }>
				{ Platform.OS == 'ios' ? (
		          <ModalContainerIOS
		            visible={ this.state.showDatePicker }
		            success={ () => this.setState({ showDatePicker: false }) }>
		            <_DatepickerContainer
						date={ this.state.formData.birthdate ? moment(this.state.formData.birthdate,'DD/MM/YYYY').toDate() : null }
						onChange={ this.changeBirthdate }
						success={ () => this.setState({ showDatePicker: false }) }
		            />
		          </ModalContainerIOS>
		        ) : (
		          this.state.showDatePicker && <_DatepickerContainer
					date={ this.state.formData.birthdate ? moment(this.state.formData.birthdate,'DD/MM/YYYY').toDate() : null }
					onChange={ this.changeBirthdate }
					success={ () => this.setState({ showDatePicker: false }) }
		          />
		        ) }

				<GradientContainer style={ styles.container }>

					{
						this.props.navigation.getParam('patient') && (
							<View style={ styles.tabContainer }>
				              <View style={ { flex: .5 } }>
				                <TouchableOpacity onPress={ () => setTab(1) }>
				                  <View style={ { 
				                    ...styles.tabItem, 
				                    backgroundColor: tab == 1 ? Colors.white : undefined,
				                    borderTopLeftRadius: 5,
				                    borderBottomLeftRadius: 5
				                  } }>
				                    <Text style={ { ...styles.tabText, color: tab == 1 ? Colors.blue : Colors.white } } numberOfLines={ 1 }>Datos del Paciente</Text>
				                  </View>
				                </TouchableOpacity>
				              </View>
				              <View style={ { flex: .5 } }>
				                <TouchableOpacity onPress={ () => setTab(2) }>
				                  <View style={ { 
				                    ...styles.tabItem, 
				                    backgroundColor: tab == 2 ? Colors.white : undefined,
				                    borderTopRightRadius: 5,
				                    borderBottomRightRadius: 5
				                  } }>
				                    <Text style={ { ...styles.tabText, color: tab == 2 ? Colors.blue : Colors.white } } numberOfLines={ 1 }>Datos Adicionales</Text>
				                  </View>
				                </TouchableOpacity>
				              </View>
		            		</View>
						)
					}

		            {
		            	tab == 1 && (
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
									!this.props.navigation.getParam('patient') && (
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
		            	)
		            }

		            {
		            	tab == 2 && (
							<ScrollView keyboardShouldPersistTaps="always">
								<TouchableWithoutFeedback onPress={ () => {
									this.setState({
										showDatePicker: true
									});
								} }>
									<View>
										<Text style={ styles.bold }>Fecha de Nacimiento</Text>
										<View style={ styles.birthdate }>
							            	<Text>{ this.state.formData.birthdate }</Text>
							            </View>
									</View>
								</TouchableWithoutFeedback>
								<View>
									<Text style={ styles.bold }>Ciudad</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'city') }
						              placeholder="Ciudad"
						              value={ this.state.formData.city }
						            />
								</View>
								<View>
									<Text style={ styles.bold }>Género</Text>
									<Picker
						              displayValue={ this.state.formData.gender.label }
						              onValueChange={ (e: any) => {
						              	if (e != '') {
						              		const value = this.state.genders.find((i: any) => i.value == e);
						              		this.changeData(value,'gender');
						              	}			              	
						              } }
						              selectedValue={ this.state.formData.gender.value }>
						              <Picker.Item
						                  value={ '' }
						                  label={ 'Seleccione' }
						              />
						              {/* */}
						              { this.state.genders.map((i: any) => (
						                <Picker.Item
						                  key={ i.value.toString() }
						                  value={ i.value }
						                  label={ i.label }
						                />
						              )) }
						            </Picker>
								</View>
								<View>
									<Text style={ styles.bold }>Tipo de Documento</Text>
									<Picker
						              displayValue={ this.state.formData.document_type_id.label }
						              onValueChange={ (e: any) => {
						              	if (e != '') {
						              		const value = this.state.document_types.find((i: any) => i.value == e);
						              		this.changeData(value,'document_type_id');
						              	}			              	
						              } }
						              selectedValue={ this.state.formData.document_type_id.value }>
						              <Picker.Item
						                  value={ '' }
						                  label={ 'Seleccione' }
						              />
						              {/* */}
						              { this.state.document_types.map((i: any) => (
						                <Picker.Item
						                  key={ i.value.toString() }
						                  value={ i.value }
						                  label={ i.label }
						                />
						              )) }
						            </Picker>
								</View>
								<View>
									<Text style={ styles.bold }>Documento de Identidad</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'document') }
						              placeholder="Documento de Identidad"
						              keyboardType="phone-pad"
						              value={ this.state.formData.document }
						            />
								</View>
								<View>
									<Text style={ styles.bold }>Estado Civil</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'marital_status') }
						              placeholder="Estado Civil"
						              value={ this.state.formData.marital_status }
						            />
								</View>
								<View>
									<Text style={ styles.bold }>Ocupación</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'occupation') }
						              placeholder="Ocupación"
						              value={ this.state.formData.occupation }
						            />
								</View>
								<View>
									<Text style={ styles.bold }>Lugar de Residencia</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'residence') }
						              placeholder="Lugar de Residencia"
						              multiline={ true }
						              numberOfLines={ 5 }
						              style={ styles.textArea }
						              value={ this.state.formData.residence }
						            />
								</View>	
								<View>
									<Text style={ styles.bold }>Responsable</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'responsable') }
						              placeholder="Responsable"
						              value={ this.state.formData.responsable }
						            />
								</View>	
								<View>
									<Text style={ styles.bold }>Parentesco del Responsable</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'responsable_relationship') }
						              placeholder="Parentesco del Responsable"
						              value={ this.state.formData.responsable_relationship }
						            />
								</View>		
								<View>
									<Text style={ styles.bold }>Teléfono del Responsable</Text>
									<TextInput
									  keyboardType="phone-pad"
						              onChangeText={ (e: any) => this.changeData(e,'responsable_phone') }
						              placeholder="Teléfono del Responsable"
						              value={ this.state.formData.responsable_phone }
						            />
								</View>
								<View>
									<Text style={ styles.bold }>Acompañante</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'companion') }
						              placeholder="Acompañante"
						              value={ this.state.formData.companion }
						            />
								</View>		
								<View>
									<Text style={ styles.bold }>Teléfono del Acompañante</Text>
									<TextInput
									  keyboardType="phone-pad"
						              onChangeText={ (e: any) => this.changeData(e,'companion_phone') }
						              placeholder="Teléfono del Acompañante"
						              value={ this.state.formData.companion_phone }
						            />
								</View>
								<View>
									<Text style={ styles.bold }>Aseguradora</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'insurance') }
						              placeholder="Aseguradora"
						              value={ this.state.formData.insurance }
						            />
								</View>	
								<View>
									<Text style={ styles.bold }>Tipo de Vinculación</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'type_union') }
						              placeholder="Tipo de Vinculación"
						              value={ this.state.formData.type_union }
						            />
								</View>	
								<View>
									<Text style={ styles.bold }>Procedimientos quirúrgicos anteriores</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'previous_procedures') }
						              placeholder="Procedimientos quirúrgicos anteriores"
						              multiline={ true }
						              numberOfLines={ 5 }
						              style={ styles.textArea }
						              value={ this.state.formData.previous_procedures }
						            />
								</View>		
								<View>
									<Text style={ styles.bold }>¿Padece de alguna enfermedad?</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'diseases') }
						              placeholder="¿Padece de alguna enfermedad?"
						              multiline={ true }
						              numberOfLines={ 5 }
						              style={ styles.textArea }
						              value={ this.state.formData.diseases }
						            />
								</View>		
								<View>
									<Text style={ styles.bold }>¿Toma algún medicamento?</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'medicines') }
						              placeholder="¿Toma algún medicamento?"
						              multiline={ true }
						              numberOfLines={ 5 }
						              style={ styles.textArea }
						              value={ this.state.formData.medicines }
						            />
								</View>		
								<View>
									<Text style={ styles.bold }>¿Es alérgico a algún medicamento?</Text>
									<TextInput
						              onChangeText={ (e: any) => this.changeData(e,'allergies') }
						              placeholder="¿Es alérgico a algún medicamento?"
						              multiline={ true }
						              numberOfLines={ 5 }
						              style={ styles.textArea }
						              value={ this.state.formData.allergies }
						            />
								</View>							
								<ButtonsContainer onBack={ () => this.props.navigation.goBack(null) }>
						          { this.state.loadingData ? (
						            <ActivityIndicator color="white" />
						          ) : (
						            <Button
						              style={ [ styles.button, styles.yellowButton ] }
						              titleStyle={ styles.whiteTitle }
						              title="Guardar"
						              onPress={ this.submitData }
						            />
						          )}
						        </ButtonsContainer>
							</ScrollView>
		            	)
		            }				
				</GradientContainer>
			</SafeAreaView>
		)
	}
}

interface ButtonsContainerProps {
  onBack?: () => void;
  children: React.ReactNode;
}

const _DatepickerContainer = (props: any) => (
    <DateTimePicker
      locale="es-ES"
      maximumDate={ new Date() }
      value={ props.date || new Date() }
      mode="date"
      display="default"
      onChange={ (_,e) => {
      	if (e) {
      		if (Platform.OS == 'android') {
      			props.success();
      		}      		
      		props.onChange(moment(e).format('DD/MM/YYYY'));
      	}      	
      } }
    />
)

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
	},
	tabContainer: {
	    flexDirection: 'row',
	    width: '90%',
	    alignSelf: 'center',
	    marginTop: 10,
	    marginBottom: 20
	},
	tabText: {
	    color: Colors.white,
	    textAlign: 'center'
	},
	tabItem: {
	    padding: 5,
	    borderWidth: 1,
	    borderColor: Colors.white
	},
	birthdate: {
		backgroundColor: Colors.gray,
	    fontSize: 12,
	    marginVertical: 12,
	    padding: 12,
	}
});

export default CreateEditPatient;