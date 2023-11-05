// @ts-nocheck
import { Avatar, Container, Flex, Heading, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { TRANSFER_CONTRACT_ADDRESS } from "../../../frontend/const/addresses";
import BalanceCard from "../../components/BalanceCard";
import Checkout from "../../components/Circle/Checkout";
import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  InputGroup,
  Input,
  Select,
} from "@chakra-ui/react";
import { Circle, CircleEnvironments, PaymentIntentCreationRequest } from "@circle-fin/circle-sdk";


export default function AccountPage() {

    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    
    const a = process.env.NEXT_PUBLIC_APP_CIRCLE_SANDBOX_API_KEY;
    
    const circle = new Circle(
      a,
      CircleEnvironments.sandbox // API base url
    );
  
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState('USD');
  
    async function createCheckoutSession() {
      setLoading(true);
      const createCheckoutSessionRes =
        await circle.checkoutSessions.createCheckoutSession({
          successUrl: "https://celebratewithhedera.co/",
          amount: {
            amount: amount,
            currency: currency,
          },
        });
  
      console.log("Checkout session created", createCheckoutSessionRes)
      setData(createCheckoutSessionRes?.data?.data);
      // setCheckoutData(createCheckoutSessionRes?.data?.data);
      setLoading(false);
    }

    const address = useAddress();
    
    function truncateAddress(address: string) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const { 
        contract: transferContract,
    } = useContract(TRANSFER_CONTRACT_ADDRESS);

    const {
        data: verifiedTokens,
        isLoading: isVerifiedTokensLoading,
    } = useContractRead(
        transferContract,
        "getVerifiedTokens"
    );
    
    return (
        <Container maxW={"1440px"} py={4}>
            {address ? (
                <Flex>
                    <Flex flexDirection={"column"} mr={8} p={10}>
                        <Avatar size={"2xl"} mb={4}/>
                        <Text 
                            fontSize={"sm"} 
                            border={"1px solid black"} 
                            textAlign={"center"} 
                            borderRadius={4}
                        >{truncateAddress(address)}</Text>
                    </Flex>
                    <Flex flexDirection={"column"} w={"100%"}>
                        <Heading>Token Balances</Heading>
                        <SimpleGrid columns={3} spacing={4} mt={4}>
                        {!isVerifiedTokensLoading ? (
                            verifiedTokens.map((token: string) => (
                                <>
                                <BalanceCard
                                    key={token}
                                    tokenAddress={token}
                                />
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex flex-col flex-1 md:mr-4 mr-0">
                                        <InputGroup mb='5'>
                                        <Input
                                            type="text"
                                            placeholder="Enter Amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)} />
                                        </InputGroup>

                                        <InputGroup mb='5'>
                                        <Select placeholder='Select option'
                                            value={currency}
                                            onChange={(e) => {
                                            setCurrency(e.target.value);
                                            }}
                                        >
                                            <option value='USD'>USDC</option>
                                            <option value='ETH'>Ethereum</option>
                                            <option value='BTC'>Bitcoin</option>
                                        </Select>
                                        </InputGroup>

                                        <Button onClick={() => {
                                        if (!loading) {
                                            createCheckoutSession();
                                        }
                                        }}>
                                        {loading ? 'Loading...' : ' Pay with Circle'}
                                        </Button>
                                    </div>
                                    <div className="flex-1 md:ml-4 ml-0 mt-4 md:mt-0">
                                        {data && <Checkout data={data} />}
                                    </div>
                                    </div>
                                </>
                            ))
                        ) : (
                            <Spinner />
                        )}
                        </SimpleGrid>
                    </Flex>
                </Flex>
            ) : (
                <Flex>
                    <Text>Connect Wallet</Text>
                </Flex>
            )}
            
        </Container>
    )
}