import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
	emptyContainer: {
	    justifyContent: 'center',
	    flex: 1,
	}
});

interface Props {
	loading: boolean,
	children: React.ReactNode
}

const LoadingContainer = (props: Props) => (
	<React.Fragment>
		{
			props.loading ? (
				<View style={ styles.emptyContainer }>
				    <ActivityIndicator size="large" />
				</View>
			) : (
				<React.Fragment>
					{ props.children }
				</React.Fragment>
			)
		}
	</React.Fragment>
)

export default LoadingContainer;