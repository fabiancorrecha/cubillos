import React from 'react';
import { Header, TextInput } from 'widgets';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';
import { Icons } from 'assets';
import { PriceService } from 'services/admin';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LoadingContainer from 'widgets/loading-container';
import { showAlert } from 'utils';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';
import Colors from 'utils/colors';

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
  user: any;
}

const styles = StyleSheet.create({
	bold: {
		fontWeight: 'bold'
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
});

class Prices extends React.Component<Props> {

	state: any = {
		prices: [],
		loading: true,
		loadingSubmit: false
	}

	componentDidMount() {
		this.load();
	}

	load = async () => {
		const res: any = await PriceService.get();
		this.setState({
			prices: res.prices,
			loading: false
		});
	}

	change = (e: any,index: number) => {
		let prices: any = [...this.state.prices];
		prices[index].amount = e;
		this.setState({
			prices
        });
	}

	submit = async () => {
		const prices_zero = this.state.prices.filter((i: any) => i.amount <= 0);
		if (prices_zero.length > 0) {
			showAlert("Error","Lo sentimos, los precios deben ser mayores a 0");
			return;
		}
		await this.setState({
			loadingSubmit: true
		});
		await PriceService.save({
			prices: this.state.prices,
			user_id: this.props.user.id
		});
		Toast.show('Se han guardado correctamente los precios');
		await this.setState({
			loadingSubmit: false
		});
		this.props.navigation.goBack(null);
	}

	render() {
		const { navigation } = this.props;

		return (
	      <SafeAreaView style={ { flex: 1 } }>
	      	<Header
	      	  backIcon={ Icons.home }
	          title="Precios"
	          icon={ Icons.menu.AdminPrices }
	          navigation={ navigation }
	        />
	        <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={ {
        		justifyContent: 'center',
        		marginTop: 20
        	} }>
		        <LoadingContainer loading={ this.state.loading }>
		        	<View style={ { padding: 20 } }>
		        		{
		        			this.state.prices.map((i: any, index: number) => (
								<View>
									<Text style={ styles.bold }>{ i.type_description }:</Text>
									<TextInput
									  maxLength={ 10 }
									  keyboardType="number-pad"
						              onChangeText={ (e: any) => this.change(e,index) }
						              value={ i.amount.toString() }
						            />
						        </View>
		        			))
		        		}
		        	</View>
		        	<LoadingContainer loading={ this.state.loadingSubmit }>
						<View style={ { alignItems: 'center' } }>
							<TouchableOpacity onPress={ this.submit }>
								<View style={ styles.searchButton }>
									<Text style={ styles.searchText }>Enviar</Text>
								</View>
							</TouchableOpacity>
						</View>
					</LoadingContainer>
		        </LoadingContainer>	
		  	</ScrollView>       
		  </SafeAreaView>
		)
	}
}

export default connect((state: any) => {
	return {
		user: state.user
	}
})(Prices);