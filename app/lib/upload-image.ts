import imageCompression from 'browser-image-compression';

export async function uploadImage(file: File): Promise<string> {
    try {
        const options = {
            maxSizeMB: 0.9, 
            maxWidthOrHeight: 1920, 
            useWebWorker: true, 
        };

        const compressedBlob = await imageCompression(file, options);
        
        const compressedFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type,
        });

        const formData = new FormData();
        formData.append("file", compressedFile);
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
        
    } catch (error) {
        console.error("Erro durante a compressão ou upload:", error);
        throw new Error("Falha no processo de imagem");
    }
}