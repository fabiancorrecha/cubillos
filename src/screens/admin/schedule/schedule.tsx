import React from 'react';
import { Header } from 'widgets';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Icons } from 'assets';
import { ScheduleService } from 'services/admin';
import { Range } from 'utils/range';
import LoadingContainer from 'widgets/loading-container';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, Image } from 'react-native';
import Colors from 'utils/colors';
import moment from 'moment';
import { Styles, showAlert } from 'utils';
import { Picker, TextInput } from 'widgets';
import Toast from 'react-native-root-toast';
import { socket } from 'services/socket';
 
interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class Schedule extends React.Component<Props> {

	state: any = {
		schedule: [],
		loading: true,
		form: {
			type: { value: 0, label: 'Todos' }
		},
		types: [
			{ value: 0, label: 'Todos' },
			{ value: 1, label: 'Diurno' },
			{ value: 2, label: 'Tarde' }
		],
		ranges: [],
		loadingSubmit: false
	}

	componentDidMount() {
		this.load();
	}

	load = async () => {
		const res: any = await ScheduleService.get();
		res.ranges.day = Range(res.ranges.day[0],res.ranges.day[1],15);
		res.ranges.late = Range(res.ranges.late[0],res.ranges.late[1],15);
		this.setState({
			schedule: res.schedule,
			ranges: res.ranges,
			loading: false
		});
	}

	submit = async () => {
		await this.setState({
			loading: true
		});
		const cant: number = this.state.schedule.filter((i: any) => i.amount == '' || i.amount == null || i.amount < 0).length;
		if (cant > 0) {
			showAlert("Alerta","Debe ingresar la cantidad de pacientes para todos los horarios");
			await this.setState({
				loading: false
			});
			return false;
		}
		await ScheduleService.save({
			schedule: this.state.schedule
		});
		await this.setState({
			loading: false
		});
		Toast.show("Se han guardado los cambios");
		socket.emit('schedule/reload');
	}

	capitalize = (text: string) => {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}

	changeHour = (e: any,type: string, index: number) => {
		const schedule: any = [ ...this.state.schedule ];
		schedule[index][type] = e;
		this.setState({
			schedule
		});
	}

	changeAmount = (e: any, index: number) => {
		const schedule: any = [ ...this.state.schedule ];
		schedule[index]['amount'] = e;
		this.setState({
			schedule
		});
	}

	changeCheck = (index: number) => {
		const schedule: any = [ ...this.state.schedule ];
		schedule[index].open = schedule[index].open == 1 ? 0 : 1;
		this.setState({
			schedule
		});
	}

	render() {
		const { navigation } = this.props;

		return (
	      <SafeAreaView style={ { flex: 1 } }>
	      	<Header
	      	  backIcon={ Icons.home }
	          title="Horario"
	          icon={ Icons.menu.AdminSchedule }
	          navigation={ navigation }
	        />
	        <LoadingContainer loading={ this.state.loading }>
	        	<ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={ { padding: 20 } }>
					<Picker
		              displayValue={ this.state.form.type.label }
		              onValueChange={ (e: any) => {
		              	const value = this.state.types.find((i: any) => i.value == e);
		              	this.change(value,'type');
		              } }
		              selectedValue={ this.state.form.type.value }>
		              { this.state.types.map((i: any) => (
		                <Picker.Item
		                  key={ i.value.toString() }
		                  value={ i.value }
		                  label={ i.label }
		                />
		              )) }
		            </Picker>

					<View style={ { alignItems: 'center' } }>
						<TouchableOpacity onPress={ async () => {
							this.setState({
								page: 1,
								data: [],
								loading: true
							});
							this.load();
						} }>
							<View style={ styles.searchButton }>
								<Text style={ styles.searchText }>Buscar</Text>
							</View>
						</TouchableOpacity>
					</View>
		    
        			{
        				this.state.schedule
							.filter((i: any) => this.state.form.type.value == 0 ? i : i.type == this.state.form.type.value)
							.map((i: any, index: number) => {
								const range: any = this.state.ranges[i.type == 1 ? 'day' : 'late'];

								return (
									<View style={ styles.item } key={ index }>
			          					<Text style={ styles.bold }>{ this.capitalize(moment.weekdays(i.day)) + ' (' + i.turn + ')' }</Text>
										<View>
											<Text>Cantidad de Personas:</Text>
											<TextInput
											  style={ styles.input }
											  maxLength={ 10 }
											  keyboardType="number-pad"
											  onChangeText={ (e: any) => this.changeAmount(e,index) }
								              value={ i.amount.toString() }
								            />
								        </View>
								        <View>
								            <Text>Hasta</Text>
								            <Picker
								              textContainerStyle={ { backgroundColor: Colors.white } }
								              displayValue={ i.start }
								              onValueChange={ (e: any) => this.changeHour(e,'start',index) }
								              selectedValue={ i.start }>
								              { range.map((i: any) => (
								                <Picker.Item
								                  key={ i.toString() }
								                  value={ i }
								                  label={ i }
								                />
								              )) }
								            </Picker>
								        </View>
								        <View>
								            <Text>Desde</Text>
								            <Picker
								              textContainerStyle={ { backgroundColor: Colors.white } }
								              displayValue={ i.end }
								              onValueChange={ (e: any) => this.changeHour(e,'end',index) }
								              selectedValue={ i.end }>
								              { range.map((i: any) => (
								                <Picker.Item
								                  key={ i.toString() }
								                  value={ i }
								                  label={ i }
								                />
								              )) }
								            </Picker>
								        </View>
								        <View>
								            <TouchableOpacity onPress={ () => this.changeCheck(index) }>
								            	<View style={ { flexDirection: 'row' } }>
								            		<Image 
								            			style={ styles.itemCheckBox }
								            			source={ i.open ? Icons.checkBoxChecked : Icons.checkBoxIdle } />
								            		<Text>Abierto</Text>
								            	</View>
								            </TouchableOpacity>
								        </View>
									</View>
								) }
							)
        			}  

		        	<LoadingContainer loading={ this.state.loadingSubmit }>
		            	<View style={ { alignItems: 'center', padding: 10 } }>
							<TouchableOpacity onPress={ this.submit }>
								<View style={ styles.searchButton }>
									<Text style={ styles.searchText }>Guardar</Text>
								</View>
							</TouchableOpacity>
						</View>
		            </LoadingContainer>	
		    	</ScrollView>	
	        </LoadingContainer>
		  </SafeAreaView>
		)
	}
}

const styles = StyleSheet.create({
	searchButton: {
		backgroundColor: Colors.blue,
		borderRadius: 5,
		padding: 5,
		marginTop: 10,
		width: 100,
		marginBottom: 20
	},
	searchText: {
		color: Colors.white,
		textAlign: 'center'
	},
	itemCheckBox: {
	    height: 24,
	    tintColor: 'rgba(0, 0, 0, 0.5)',
	    width: 24,
	    marginEnd: 8,
	},
	button: {
	    alignSelf: 'center',
	    backgroundColor: Colors.yellow,
	    borderRadius: 100,
	    paddingHorizontal: 16,
	    paddingVertical: 8,
	    marginHorizontal: 16,
	    marginTop: 16,
	},
	item: {
		backgroundColor: Colors.gray,
		borderRadius: 5,
		marginBottom: 10,
		padding: 10,
		...Styles.shadow
	},
	padding: {
		padding: 20
	},
	bold: {
		fontWeight: 'bold',
		marginBottom: 10
	},
	input: {
		backgroundColor: Colors.white
	}
});

export default Schedule;