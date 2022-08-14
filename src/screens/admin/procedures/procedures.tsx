import React from 'react';
import { Header } from 'widgets';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Icons } from 'assets';
import { ProcedureService } from 'services/admin';
import LoadingContainer from 'widgets/loading-container';
import { SafeAreaView, Alert, ActivityIndicator, StyleSheet, View, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, Image } from 'react-native';
import Button from 'widgets/button';
import Colors from 'utils/colors';
import { TextInput, Label } from 'widgets';
import moment from 'moment';
import { Styles } from 'utils';
import Toast from 'react-native-root-toast';
import { OptionsMenu } from 'widgets';
import { on } from 'jetemit';
import { TypePhotoService } from 'services';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

class Procedures extends React.Component<Props> {

	state = {
		page: 1,
		last_page: 1,
		data: [],
		loading: true,
		form: {
			search: ''
		},
		isLoadingMore: false,
		subscriber: () => null,
		typePhotos: []
	}

	componentDidMount() {
		this.load();

		this.setState({
			subscriber: on('procedures/save',async (_data: any) => {
				await this.setState({
					page: 1,
					data: [],
					loading: true
				});
				this.load();
			})
		});
	}

	componentWillMount() {
		this.state.subscriber();
	}

	load = async () => {
		const params = {
			...this.state.form, 
			page: this.state.page
		}
		Promise.all([
			ProcedureService.get(params),
			TypePhotoService.all()
		]).then((res: any) => {
			this.setState({
				data: [...this.state.data, ...res[0].procedures.data],
				last_page: res[0].procedures.last_page,
				loading: false,
				isLoadingMore: false,
				typePhotos: res[1].photos
			});
		}).catch(err => console.log(err));		
	}

	renderFooter = () => {
	    const { isLoadingMore, last_page, page } = this.state;

	    if (isLoadingMore) {
	      return (
	        <ActivityIndicator
	          color={ Colors.yellow }
	          style={ styles.activityIndicator }
	        />
	      );
	    }

	    if (last_page > page) {
	      return (
	        <Button
	          onPress={ async () => {
	          	await this.setState({
	          		page: this.state.page + 1,
	          		isLoadingMore: true
	          	});
	          	this.load();
	          } }
	          style={ styles.button }
	          textBold
	          title="Cargar más"
	          titleStyle={ styles.buttonTitle }
	        />
	      );
	    }

	    return null;
	}

	change = (e: any, name: string) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e
			}
        });
	}
	
	edit = (procedure: any) => {
		this.props.navigation.navigate('CreateEditProcedure',{
			procedure,
			photos: this.state.typePhotos
		});
	}

	create = () => {
		this.props.navigation.navigate('CreateEditProcedure',{
			photos: this.state.typePhotos
		});
	}

	delete = (item: any) => {
		Alert.alert(
		  "Confirmar",
		  "¿Desea eliminar el procedimiento?",
		  [
		    { text: 'Continuar', onPress: async () => {
		    	await this.setState({
					loading: true
				});
		    	await ProcedureService.delete({
					id: item.id
				});
				let procedures: any = [ ...this.state.data ];
				procedures = procedures.filter((i: any) => i.id != item.id);
				await this.setState({
					data: procedures,
					loading: false
				});
				Toast.show("Se ha eliminado el procedimiento");
		    }},
		    {
		      text: 'Cancelar'
		    }
		  ],
		  { cancelable: false },
		);
	}

	render() {
		const { navigation } = this.props;

		return (
	      <SafeAreaView style={ { flex: 1 } }>
	      	<Header
	      	  backIcon={ Icons.home }
	          title="Procedimientos"
	          icon={ Icons.menu.AdminProcedures }
	          navigation={ navigation }
	        />
	        <LoadingContainer loading={ this.state.loading }>
				<View style={ { padding: 10 } }>
					<TextInput
		              onChangeText={ (e: any) => this.change(e,'search') }
		              placeholder="Buscar"
		              value={ this.state.form.search }
		            />
					<View style={ { alignItems: 'center' } }>
						<TouchableOpacity onPress={ async () => {
							await this.setState({
								page: 1,
								loading: true,
								data: []
							});
							this.load();
						} }>
							<View style={ styles.searchButton }>
								<Text style={ styles.searchText }>Buscar</Text>
							</View>
						</TouchableOpacity>
					</View>

					<View style={ { alignItems: 'flex-end' } }>
						<TouchableOpacity onPress={ this.create }>
							<View style={ styles.searchButtonYellow }>
								<Text style={ styles.searchText }>Nuevo Procedimiento</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>				

				<FlatList
				  contentContainerStyle={ styles.padding }
		          data={ this.state.data }
		          keyExtractor={ (item: any) => item.id.toString() }
		          ListFooterComponent={ this.renderFooter }
		          ListEmptyComponent={
	        	  	<Text style={ { textAlign: 'center', fontSize: 16 } }>No hay procedimientos registrados</Text>
	        	  }
		          renderItem={ ({ item: i }) => (
	          		<View style={ styles.item }>
	          			<View style={ { flex: .3, alignItems: 'center', justifyContent: 'center' } }>
	          				<Image style={ styles.icon } source={ Icons.menu.AdminProcedures } />
	          			</View>
	          			<View style={ { flex: .6 } }>
	          				<Text numberOfLines={ 1 } style={ { ...styles.bold, marginTop: 10 } }>{ i.name }</Text>
						</View>	
						<View style={ { flex: .1, alignItems: 'flex-end' } }>
							<OptionsMenu
			                  options={ [
			                    {
			                      label: 'Editar',
			                      action: () => this.edit(i)
			                    },
			                    {
			                      label: 'Eliminar',
			                      action: () => this.delete(i)
			                    },
			                  ] }>
			                  <View style={ { alignItems: 'center', flexDirection: 'row' } }>
			                    <Image
			                      source={ Icons.options }
			                      style={ {
			                        width: 16,
			                        height: 16,
			                        marginVertical: 12,
			                        marginStart: 12,
			                        marginEnd: 6,
			                      } }
			                    />
			                  </View>
			                </OptionsMenu>
						</View>						
					</View>
		          ) }
		        />
	        </LoadingContainer>
		  </SafeAreaView>
		)
	}
}

const styles = StyleSheet.create({
	button: {
	    alignSelf: 'center',
	    backgroundColor: Colors.yellow,
	    borderRadius: 100,
	    paddingHorizontal: 16,
	    paddingVertical: 8,
	    marginHorizontal: 16,
	    marginTop: 16,
	},
	buttonTitle: {
	    color: 'white',
	},
	activityIndicator: {
	    paddingVertical: 24,
	    paddingHorizontal: 16,
	},
	searchButton: {
		backgroundColor: Colors.blue,
		borderRadius: 5,
		padding: 5,
		marginTop: 10,
		width: 100,
		marginBottom: 10
	},
	searchButtonYellow: {
		backgroundColor: Colors.yellow,
		borderRadius: 5,
		padding: 5,
		marginTop: 20
	},
	searchText: {
		color: Colors.white,
		textAlign: 'center'
	},
	padding: {
		padding: 20
	},
	icon: {
		resizeMode: 'contain',
		width: 40,
		height: 40,
		tintColor: '#000'
	},
	item: {
		backgroundColor: Colors.gray,
		borderRadius: 5,
		marginBottom: 10,
		padding: 10,
		flexDirection: 'row',
		...Styles.shadow
	},
	bold: {
		fontWeight: 'bold'
	}
});

export default Procedures;