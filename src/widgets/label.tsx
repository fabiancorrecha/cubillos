import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import Colors from 'utils/colors';

interface Props extends TextProps {
	label: string,
	children: React.ReactNode
}

export const Label = (props: Props) => (
	<Text {...props}>
		<Text style={ styles.label }>{ props.label }: </Text>
		<Text style={ styles.black }>{ props.children }</Text>
	</Text>
)

const styles = StyleSheet.create({
	label: {
		fontWeight: 'bold',
		color: Colors.black,
		fontSize: 12
	},
	black: {
		color: Colors.black,
		fontSize: 12
	}
});