//@ts-nocheck
"use client";

// some comment
import React, {useState, useRef, useContext} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, UploadCloud } from "lucide-react";
import {AuthContext} from "@/providers/AuthProvider";
import toast from "react-hot-toast";

export default function Page() {

    const [formData, setFormData] = useState({
        name: "",
        lat: "",
        lon: "",
        type: "",
        city: "",
        country: "",
        apiKey: "",
        county: "N/A",
        province: "N/A",
        municipality: "N/A",
        borough: "N/A",
        district: "N/A",
        metadata: {},
        images: []
    });
    const [images , setImages] = useState([]);

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let token = currentUser?.token || null;
        if (!token) {
            alert("Token not found");
            return;
        }

        setUploading(true);

        try {
            for (const file of files) {
                const policy = {
                    prefix: "images",
                    ext: file.name.split(".").pop(),
                    contentType: file.type,
                    maxSize: 10485760 // 10MB
                };

                const presignRes = await fetch(`${process.envNEXT_PUBLIC_BASE_URL}/v1/storage/pre-sign/post-policy`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ policies: [policy] })
                });

                if (!presignRes.ok) {
                    throw new Error(`Failed to get presigned policy for ${file.name}`);
                }

                const data = await presignRes.json();
                const { url, formData: uploadFields } = data.urls[0];

                const body = new FormData();
                for (const key in uploadFields) {
                    body.append(key, uploadFields[key]);
                }
                body.append("file", file);

                const res = await fetch(url, {
                    method: "POST",
                    body
                });

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.statusText}`);
                }

                const uploadedPath = `${uploadFields.key}`;
                setFormData(prev => ({
                    ...prev,
                    images: [
                        ...prev.images,
                        {
                            name: file.name,
                            preview: URL.createObjectURL(file),
                            path: `${process.env.NEXT_MINIO_IMAGE_BUCKET}+uploadedPath`
                        }


                    ]
                }));

                toast.success(`${file.name} uploaded`);
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return {
                ...prev,
                images: newImages
            };
        });
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "metadata") {

            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    myvalue: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = () => {

        let token = currentUser?.user?.token || null
        if (token) {
            formData.apiKey = token[0].token;

            let imagePaths = []


            for (let i=0; i < formData.images.length; i++) {
                imagePaths.push({
                    "image-url" : formData.images[i].path,
                    "altText" : "place",
                    "order" : i,
                    "captions" : []

                })
            }
            formData.images = imagePaths;

            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/route/addPlace`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }).then((res) => {
                if (res.ok) {
                    console.log("place updated")
                }
            })


            console.log(formData);

        }else{
            alert("please create an api token")
        }

    };

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-screen">

            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New Place</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form Fields */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Place Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {id: "name", label: "Name", colSpan: "md:col-span-2"},
                            {id: "type", label: "Type"},
                            {id: "city", label: "City"},
                            {id: "country", label: "Country"},
                            {id: "lat", label: "Latitude"},
                            {id: "lon", label: "Longitude"}
                        ].map((field) => (
                            <div key={field.id} className={field.colSpan || ""}>
                                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {field.label}
                                </Label>
                                <Input
                                    id={field.id}
                                    name={field.id}
                                    value={formData[field.id]}
                                    onChange={handleChange}
                                    className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <Label htmlFor="metadata" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Metadata
                        </Label>
                        <Input
                            id="metadata"
                            name="metadata"
                            value={formData.metadata.myvalue || ""}
                            onChange={handleChange}
                            className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Enter custom metadata value"
                        />
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {id: "county", label: "County"},
                            {id: "province", label: "Province"},
                            {id: "municipality", label: "Municipality"},
                            {id: "borough", label: "Borough"},
                            {id: "district", label: "District"},
                        ].map((field) => (
                            <div key={field.id}>
                                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {field.label}
                                </Label>
                                <Input
                                    id={field.id}
                                    name={field.id}
                                    value={formData[field.id]}
                                    onChange={handleChange}
                                    className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                        ))}
                    </div>
                </div>


                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Images</h2>

                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageUpload}
                            multiple
                            className="hidden"
                        />
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Drag and drop images here, or click to select files
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PNG, JPG, GIF up to 10MB
                        </p>
                    </div>

                    {uploading && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-700 dark:text-blue-300">
                            <p>Uploading images, please wait...</p>
                        </div>
                    )}

                    {/* Image Gallery */}
                    {formData.images.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Uploaded Images</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={image.preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{image.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
                <Button
                    onClick={handleSubmit}
                    className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-6 py-2 rounded-md shadow"
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}
