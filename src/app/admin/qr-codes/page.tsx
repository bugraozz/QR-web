"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, QrCode, RefreshCw } from "lucide-react"
import axios from "axios";

export default function QRCodePage() {
  const [qrValue, setQrValue] = useState("https://example.com/menu")
  const [qrSize, setQrSize] = useState("200")
  const [qrColor, setQrColor] = useState("#000000")
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF")
  const [qrLogo, setQrLogo] = useState("")
  const [qrCodeImage, setQrCodeImage] = useState("")
  const [qrErrorCorrection, setQrErrorCorrection] = useState("M"); // Default to Medium error correction
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchLastQRCodeConfig = async () => {
    try {
      const response = await axios.get("/api/admin/qr-codes");
      const config = response.data as {
        menu_url: string;
        size: number;
        color: string;
        bg_color: string;
        error_correction: string;
      };

      setQrValue(config.menu_url);
      setQrSize(config.size.toString());
      setQrColor(config.color);
      setQrBgColor(config.bg_color);
      setQrErrorCorrection(config.error_correction);
    } catch (error) {
      console.error("Failed to fetch last QR code configuration:", error);
    }
  };

  const saveQRCodeConfig = async () => {
    try {
      await axios.post("/api/admin/qr-codes", {
        menu_url: qrValue,
        size: parseInt(qrSize),
        color: qrColor,
        bg_color: qrBgColor,
        error_correction: qrErrorCorrection,
      });
      console.log("QR code configuration saved successfully");
    } catch (error) {
      console.error("Failed to save QR code configuration:", error);
    }
  };

  useEffect(() => {
    fetchLastQRCodeConfig();
  }, []);

  const handleGenerateQRCode = () => {
    generateQRCode(); // Only generate the QR code
  };

  const handleSaveQRCodeConfig = async () => {
    try {
      await axios.post("/api/admin/qr-codes", {
        menu_url: qrValue,
        size: parseInt(qrSize),
        color: qrColor,
        bg_color: qrBgColor,
        error_correction: qrErrorCorrection,
      });
      console.log("QR code configuration saved successfully");
    } catch (error) {
      console.error("Failed to save QR code configuration:", error);
    }
  };

  // Generate QR code
  const generateQRCode = () => {
    // In a real implementation, you would use a library like qrcode.react
    // For this example, we'll simulate it with a placeholder
    const baseUrl = "https://api.qrserver.com/v1/create-qr-code/"
    const params = new URLSearchParams({
      data: qrValue,
      size: `${qrSize}x${qrSize}`,
      color: qrColor.replace("#", ""),
      bgcolor: qrBgColor.replace("#", ""),
      ecc: qrErrorCorrection, // Add error correction level
    })

    const qrUrl = `${baseUrl}?${params.toString()}`
    setQrCodeImage(qrUrl)
  }

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCodeImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle cross-origin issues
    img.src = qrCodeImage;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const jpegUrl = canvas.toDataURL("image/jpeg");

        const link = document.createElement("a");
        link.href = jpegUrl;
        link.download = "restaurant-menu-qr.jpeg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    img.onerror = (error) => {
      console.error("Failed to load QR code image for download:", error);
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
              <CardDescription>Customize your menu QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="url">Menu URL</Label>
                <Input
                  id="url"
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  placeholder="https://yourrestaurant.com/menu"
                />
                <p className="text-xs text-muted-foreground">
                  This is the URL that will open when customers scan your QR code
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="size">Size (px)</Label>
                  <Input
                    id="size"
                    type="number"
                    value={qrSize}
                    onChange={(e) => setQrSize(e.target.value)}
                    min="100"
                    max="1000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="error-correction">Error Correction</Label>
                  <Select
                    value={qrErrorCorrection}
                    onValueChange={(value) => setQrErrorCorrection(value)} // Update state on selection
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="color">QR Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="bg-color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
               
             
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleGenerateQRCode}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>
              <Button variant="outline" onClick={handleSaveQRCodeConfig}>
                Save Configuration
              </Button>
            </CardFooter>
          </Card>

          
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Preview</CardTitle>
              <CardDescription>Your generated QR code</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              {qrCodeImage ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="border rounded-md p-4 bg-white">
                    <img src={qrCodeImage || "/placeholder.svg"} alt="QR Code" className="max-w-full" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">Scan with your smartphone camera to test</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 w-full">
                  <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your QR code will appear here</p>
                  <Button variant="outline" className="mt-4" onClick={generateQRCode}>
                    Generate QR Code
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              {qrCodeImage && (
                <Button onClick={downloadQRCode}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              )}
            </CardFooter>
          </Card>

         
        </div>
      </div>
    </div>
  )
}

