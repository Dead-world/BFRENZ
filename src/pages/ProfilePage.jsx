import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Profile: {id}</h1>
    </div>
  );
}
 
