import React from 'react';
import { TextInput, Picker, Label } from 'widgets';
import { Text, StyleSheet, View, TouchableOpacity, Image, Keyboard, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import Colors from 'utils/colors';
import { Icons } from 'assets/icons';
import { BudgetService, EvaluationService } from 'services/admin';
import Toast from 'react-native-root-toast';
import LoadingContainer from 'widgets/loading-container';
import { formatCurrency, DownloadFile } from 'utils';
import { emit } from 'jetemit';
import { socket } from 'services/socket';
import FileViewer from 'react-native-file-viewer';

interface Props {
	currencies: Array<any>,
	procedures: Array<any>,
	evaluation: any
}

const styles = StyleSheet.create({
	bold: {
		fontWeight: 'bold',
		color: Colors.black
	},
	itemOdd: {
	    backgroundColor: 'white',
	},
	itemEven: {
	    backgroundColor: Colors.gray,
	},
	itemTitle: {
	    color: 'rgba(0, 0, 0, 0.87)',
	    fontSize: 14,
	},
	item: {
	    paddingVertical: 8,
	    paddingHorizontal: 24,
	    flexDirection: 'row',
	    alignItems: 'center',
	},
	itemCheckBox: {
	    height: 24,
	    tintColor: 'rgba(0, 0, 0, 0.5)',
	    width: 24,
	    marginEnd: 8,
	},
	itemTextContainer: {
	    paddingEnd: 16,
	},
	searchButton: {
		backgroundColor: Colors.blue,
		borderRadius: 5,
		padding: 5,
		marginTop: 10,
		width: 100,
		marginBottom: 10
	},
	searchText: {
		color: Colors.white,
		textAlign: 'center'
	},
	circle: {
		width: 5,
		height: 5,
		backgroundColor: Colors.black,
		borderRadius: 2.5,
		marginRight: 5,
		marginLeft: 15
	},
	black: {
		color: Colors.black
	},
	item_budget: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8
	},
	size: {
		fontSize: 16
	}
});

class Budgets extends React.Component<Props> {

	state = {
		form: {
			amount: 0,
			description: '',
			currency: {
				value: '',
				label: 'Seleccione'
			}
		},
		procedures: [...this.props.procedures.map((i: any) => {
			i.selected = false;
			return i;
		})],
		loading: false,
		edit: false,
		evaluation: { ...this.props.evaluation },
		currencies: [...this.props.currencies]
	}

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}

	onPress = (item: any) => {
		const procedures: any = [...this.state.procedures];
		const index: number = procedures.findIndex((i: any) => i.id == item.id);
		procedures[index].selected = procedures[index].selected == false;
		this.setState({
			procedures
		});
	}

	submit = async () => {
		Keyboard.dismiss();
		await this.setState({
			loading: true
		});
		let id = null;
		if (this.state.evaluation && this.state.evaluation.budgets.length > 0) {
			 id = this.state.evaluation.budgets[0].id;
		}
		let form: any = {
			amount: this.state.form.amount,
			currency_id: this.state.form.currency.value,
			evaluation_id: this.state.evaluation.id,
			description: this.state.form.description,
			id
		}
		const res: any = await BudgetService.create(form,() => {
			this.setState({
				loading: false
			});
		});
		this.setState({
			loading: false
		});
		Toast.show('Se ha enviado el presupuesto correctamente');
		const evaluation: any = { ...this.state.evaluation };
		evaluation.budgets = res.budgets;
		emit('budgets/create',{
			id: this.state.evaluation.id,
			budgets: res.budgets
		});
		socket.emit('evaluations/budget',res.evaluations);
		this.setState({
			evaluation,
			edit: false
		});
	}

	edit = (status: boolean) => {
		this.setState({
			edit: status
		});
		if (this.state.evaluation && this.state.evaluation.budgets.length > 0) {
			const checked = this.state.evaluation.budgets[0].procedures.map((i: any) => i.id);
			const procedures: any = this.props.procedures.map((i: any) => {
				i.selected = false;
				if (checked.indexOf(i.id) != -1) {
					i.selected = true;
				}
				return i;
			});
			this.setState({
				procedures,
				form: {
					description: this.state.evaluation.budgets[0].description,
					amount: this.state.evaluation.budgets[0].amount,
					currency: {
						label: this.state.evaluation.budgets[0].currency.name,
						value: this.state.evaluation.budgets[0].currency.id
					}
				}
			});
		}
	}

	finish = () => {		
		Alert.alert(
		  "Confirmar",
		  "¿Desea finalizar la evaluación? Esta acción no se puede deshacer",
		  [
		    { text: 'Continuar', onPress: async () => {
		    	await this.setState({
					loading: true
				});
				await EvaluationService.finish({
					id: this.props.evaluation.id
				},() => {
					this.setState({
						loading: false
					});
				});
				Keyboard.dismiss();
				Toast.show("Se ha finalizado la evaluación");
				const evaluation: any = { ...this.state.evaluation };
				evaluation.status = 0;
				this.setState({
					loading: false,
					evaluation
				});								
				emit('evaluations/finish',evaluation);
				socket.emit('evaluations/finish',evaluation);
		    }},
		    {
		      text: 'Cancelar'
		    }
		  ],
		  { cancelable: false },
		);
	}

	generate = async () => {
		const budget = this.state.evaluation.budgets[0];
		if (Platform.OS == 'android') {
			const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
		    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
		    	this.continuePrint(budget);
		    }
		}
		else {
			this.continuePrint(budget);
		}		
	}

	continuePrint = async (budget: any) => {
		const res: any = await BudgetService.print({
			id: budget.id
		});
		const path = await DownloadFile.download(res.url);
		if (Platform.OS == 'ios') {
		    Linking.openURL(path.path()).catch((err) => {
		      console.log(err)
		    });
		}
		else {
			FileViewer.open(path.path(),{
				showOpenWithDialog: true
			}).catch((err: any) => console.log(err))
			  .finally(async () => {
				await BudgetService.deletePrint({
					name: res.name
				});
			  });
		}		
	}
	
	render() {
		return (
			<React.Fragment>
				{
					this.state.evaluation && this.state.evaluation.budgets.length > 0 && !this.state.edit && (
						<React.Fragment>
							<Text style={ { marginBottom: 10, ...styles.size } }>
								<Text style={ styles.bold }>Presupuesto: </Text>
								<Text>{ formatCurrency(this.state.evaluation.budgets[0].currency.code + ' ',this.state.evaluation.budgets[0].amount) }</Text>
							</Text>
							{
								this.state.evaluation.status == 1 && (
									<View style={ { flexDirection: 'row', alignItems: 'center', marginTop: 10 } }>
										<View style={ { flex: .5 } }>											
											<LoadingContainer loading={ this.state.loading }>
												<TouchableOpacity onPress={ () => this.finish() }>
													<View style={ { ...styles.searchButton, width: '90%', alignSelf: 'center', backgroundColor: Colors.red } }>
														<Text style={ styles.searchText }>Finalizar</Text>
													</View>
												</TouchableOpacity>
											</LoadingContainer>
										</View>
										<View style={ { flex: .5 } }>
											<TouchableOpacity onPress={ () => this.edit(true) }>
												<View style={ { ...styles.searchButton, width: '90%', alignSelf: 'center' } }>
													<Text style={ styles.searchText }>Editar</Text>
												</View>
											</TouchableOpacity>
										</View>								
									</View>
								)
							}
							<TouchableOpacity onPress={ this.generate }>
								<View style={ { ...styles.searchButton, width: '50%', alignSelf: 'center' } }>
									<Text style={ styles.searchText }>Generar Formato</Text>
								</View>
							</TouchableOpacity>
						</React.Fragment>
					)
				}

				{
					this.state.evaluation && (this.state.evaluation.budgets.length == 0 || this.state.edit) && (
						<React.Fragment>
							<View>
								<Text style={ styles.bold }>Presupuesto:</Text>
								<TextInput
								  maxLength={ 14 }
								  editable={ !this.state.loading }
								  keyboardType="number-pad"
					              onChangeText={ (e: any) => this.change(e,'amount') }
					              value={ this.state.form.amount.toString() }
					            />
				            </View>
							<View>
								<Text style={ styles.bold }>Moneda</Text>
					            <Picker
					              enabled={ !this.state.loading }
					              displayValue={ this.state.form.currency.label }
					              onValueChange={ (e: any) => {
					              	if (e != '') {
					              		const currencies = [ ...this.state.currencies ];
						              	const value = currencies.map((i: any) => {
						              		return {
						              			value: i.id,
						              			label: i.name
						              		}
						              	}).find((i: any) => i.value == e);
						              	this.change(value,'currency');
						            }					              	
					              } }
					              selectedValue={ this.state.form.currency.value }>
					              	<Picker.Item
					                  value={ '' }
					                  label={ 'Seleccione' }
					              	/>
					              	{/* */}
						            { this.state.currencies.map((i: any) => (
										<Picker.Item
						                  key={ i.id.toString() }
						                  value={ i.id }
						                  label={ i.name }
						                />
						            )) }
					            </Picker>
							</View>
							<View>
								<Text style={ styles.bold }>Descripción:</Text>
								<TextInput
								  multiline={ true }
								  style={ { minHeight: 150 } }
								  editable={ !this.state.loading }
					              onChangeText={ (e: any) => this.change(e,'description') }
					              value={ this.state.form.description }
					              numberOfLines={ 5 }
					            />
				            </View>
							<LoadingContainer loading={ this.state.loading }>
								<View style={ { alignItems: 'center' } }>
									<TouchableOpacity onPress={ this.submit }>
										<View style={ styles.searchButton }>
											<Text style={ styles.searchText }>Enviar</Text>
										</View>
									</TouchableOpacity>
								</View>
							</LoadingContainer>
						</React.Fragment>
					)
				}
			</React.Fragment>
		)
	}
}

export default Budgets;