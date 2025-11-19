"use client";

import { ColorModeButton } from "@/components/ui/color-mode";
import { Box, Flex, Stack, Text, Input, IconButton, Avatar } from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";

export function Chat() {
  return (
    <Flex h="100vh">
      <Stack w="20%" bg="gray.900" p={4} gap={4} alignItems="flex-start" direction="column">
        <Text fontSize="xl" fontWeight="bold">
          Chat Rooms
        </Text>
        <Stack gap={2} alignItems="flex-start" direction="column">
          <Text># general</Text>
          <Text># random</Text>
          <Text># tech</Text>
        </Stack>
        <Box flex="1" />
        <ColorModeButton />
      </Stack>
      <Flex flex="1" direction="column">
        <Stack flex="1" p={4} gap={4} alignItems="flex-start" direction="column">
          <Stack direction="row">
            <Avatar.Root>
              <Avatar.Fallback>U1</Avatar.Fallback>
            </Avatar.Root>
            <Stack alignItems="flex-start" gap={1} direction="column">
              <Text fontWeight="bold">User 1</Text>
              <Text bg="gray.700" p={2} borderRadius="md">
                Hello!
              </Text>
            </Stack>
          </Stack>
          <Stack alignSelf="flex-end" direction="row">
            <Stack alignItems="flex-end" gap={1} direction="column">
              <Text fontWeight="bold">You</Text>
              <Text bg="blue.500" p={2} borderRadius="md">
                Hi there!
              </Text>
            </Stack>
            <Avatar.Root>
              <Avatar.Fallback>Y</Avatar.Fallback>
            </Avatar.Root>
          </Stack>
        </Stack>
        <Stack p={4} direction="row">
          <Input placeholder="Type a message..." />
          <IconButton aria-label="Send message">
            <LuSend />
          </IconButton>
        </Stack>
      </Flex>
    </Flex>
  );
}
