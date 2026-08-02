import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Profile: {id}</h1>
    </div>
  );
}
<<<<<<< HEAD:src/pages/ProfilePage.Jsx
  
=======
 
>>>>>>> 3435961a7516f05a642297710e2be3ee42ca2ad5:src/pages/ProfilePage.jsx
