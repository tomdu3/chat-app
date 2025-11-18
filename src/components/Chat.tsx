"use client";

import { ColorModeButton } from "@/components/ui/color-mode";
import { Box, Flex, VStack, HStack, Text, Input, IconButton, Avatar } from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";

export function Chat() {
  return (
    <Flex h="100vh">
      <VStack w="20%" bg="gray.900" p={4} spacing={4} alignItems="flex-start">
        <Text fontSize="xl" fontWeight="bold">
          Chat Rooms
        </Text>
        <VStack spacing={2} alignItems="flex-start">
          <Text># general</Text>
          <Text># random</Text>
          <Text># tech</Text>
        </VStack>
        <Box flex="1" />
        <ColorModeButton />
      </VStack>
      <Flex flex="1" direction="column">
        <VStack flex="1" p={4} spacing={4} alignItems="flex-start">
          <HStack>
            <Avatar.Root>
              <Avatar.Fallback>U1</Avatar.Fallback>
            </Avatar.Root>
            <VStack alignItems="flex-start" spacing={1}>
              <Text fontWeight="bold">User 1</Text>
              <Text bg="gray.700" p={2} borderRadius="md">
                Hello!
              </Text>
            </VStack>
          </HStack>
          <HStack alignSelf="flex-end">
            <VStack alignItems="flex-end" spacing={1}>
              <Text fontWeight="bold">You</Text>
              <Text bg="blue.500" p={2} borderRadius="md">
                Hi there!
              </Text>
            </VStack>
            <Avatar.Root>
              <Avatar.Fallback>Y</Avatar.Fallback>
            </Avatar.Root>
          </HStack>
        </VStack>
        <HStack p={4}>
          <Input placeholder="Type a message..." />
          <IconButton aria-label="Send message" icon={<LuSend />} />
        </HStack>
      </Flex>
    </Flex>
  );
}
