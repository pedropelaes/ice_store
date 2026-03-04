export async function uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME || "");

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error("Erro ao fazer upload da imagem");
        }

        const data = await res.json();
        return data.secure_url; 
    }