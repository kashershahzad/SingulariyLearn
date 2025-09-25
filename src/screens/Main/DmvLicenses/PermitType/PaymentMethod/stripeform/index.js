import React, { useState } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';

export default function StripeForm() {
  const [cardDetails, setCardDetails] = useState(null);
  const { confirmPayment } = useStripe();

  const clientSecret = "pk_test_your_client_secret_from_backend";
  

  const handlePayPress = async () => {
    if (!cardDetails?.complete) {
      alert("Please enter complete card details");
      return;
    }

    const { paymentIntent, error } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
    });

    if (error) {
      console.log("Payment failed: ", error.message);
    } else if (paymentIntent) {
      console.log("Payment successful: ", paymentIntent);
      alert("Payment Successful!");
    }
  };

  return (
    <View style={styles.container}>

      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={(cardDetails) => setCardDetails(cardDetails)}
      />

      <Button title="Pay Now" onPress={handlePayPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
});
