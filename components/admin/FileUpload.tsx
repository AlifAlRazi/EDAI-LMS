"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUpload: (url: string, publicId: string, resourceType: string) => void;
  accept?: "image" | "video" | "raw"; // raw is for PDFs/docs
  buttonLabel?: string;
  className?: string;
}

export default function FileUpload({ onUpload, accept = "image", buttonLabel = "Upload File", className }: FileUploadProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  // Cloudinary resource types mapping
  const resourceType = accept === "image" ? "image" : accept === "video" ? "video" : "raw";
  
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"} 
      options={{
        maxFiles: 1,
        resourceType: resourceType,
        clientAllowedFormats: accept === "image" ? ["png", "jpeg", "jpg", "webp"] 
                            : accept === "video" ? ["mp4", "webm"] 
                            : ["pdf", "doc", "docx"],
      }}
      onSuccess={(result, { widget }) => {
        if (result?.info && typeof result.info !== "string") {
          onUpload(result.info.secure_url, result.info.public_id, result.info.resource_type);
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
          widget.close();
        }
      }}
    >
      {({ open }) => {
        return (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => open()}
            className={`flex items-center gap-2 border-white/20 bg-dark-100 text-white hover:bg-white/10 ${className}`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {isSuccess ? "Uploaded!" : buttonLabel}
          </Button>
        );
      }}
    </CldUploadWidget>
  );
}
