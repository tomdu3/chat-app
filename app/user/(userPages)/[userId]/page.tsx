type Props = {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserDetails({ params }: Props) {
  const { userId } = await params;
  return <p>User Details: {userId}</p>;
}
