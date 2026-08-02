import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-primary">
        Profile: {id}
      </h1>
    </div>
  );
}
