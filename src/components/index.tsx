import React, { useEffect, useState, useRef } from "react";
import * as fabric from "fabric";
import jsPDF from "jspdf";
import backgroundImage from "../assets/background.png";

const GreetingCardEditor: React.FC = () => {
  const frontCanvasRef = useRef<fabric.Canvas | null>(null);
  const insideCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isFrontVisible, setIsFrontVisible] = useState(true);
  const [cardJson, setCardJson] = useState<string>("");

  const urlMap = {
    VT323:
      'url(https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJXUdVNF.woff2)',
    Pacifico:
      'url(https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6MmBp0u-.woff2)',
    Lato100:
      'url(https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHh30AXC-qNiXg7Q.woff2)',
    Lato900:
      'url(https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwiPGQ3q5d0.woff2)',
  };

  const [selectedFont, setSelectedFont] = useState("Roboto"); // Default
  const [selectedFontSize, setSelectedFontSize] = useState("32"); // Default
  const fontPacifico = new FontFace('Pacifico', urlMap.Pacifico, {
    style: 'normal',
    weight: 'normal',
  });

  const fontVT323 = new FontFace('VT323', urlMap.VT323, {
    style: 'normal',
    weight: 'normal',
  });


  Promise.all([
    fontVT323.load(),
    fontPacifico.load(),
  ]).then(() => {
    // add the css to the document for those loaded fonts
    document.fonts.add(fontPacifico);
    document.fonts.add(fontVT323);
  });

  useEffect(() => {
    // Initialize the Fabric.js canvas
    const canvas = new fabric.Canvas("greetingCardFrontCanvas", {
      width: 421, // Canvas width
      height: 584, // Canvas height
      backgroundColor: "#ffffff", // Background color
      preserveObjectStacking: true
    });

    const insideCanvas = new fabric.Canvas("greetingCardInsideCanvas", {
        width: 421, // Canvas width
        height: 584, // Canvas height
        backgroundColor: "#ffffff", // Background color
        preserveObjectStacking: true
      });

    frontCanvasRef.current = canvas;
    insideCanvasRef.current = insideCanvas;

    // Load and add the background image as a locked object
    const imgElement = new Image();
    imgElement.src = backgroundImage;
    imgElement.crossOrigin = "anonymous"; // Fix for cross-origin issues

    imgElement.onload = () => {
      const img = new fabric.FabricImage(imgElement);

      // Scale the image to fit the canvas
      const scaleX = canvas.width! / img.width!;
      const scaleY = canvas.height! / img.height!;
      const scale = Math.min(scaleX, scaleY);

      img.set({
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      // Add the image to the canvas
      canvas.add(img);
      canvas.sendObjectToBack(img);;
      canvas.renderAll();
      console.log("Image added to the canvas successfully.");
    };


    // const fixedTextElement = new fabric.Textbox("Happy Birthday", {
    //     left: 0,
    //     top: 20,
    //     width: 421,
    //     fontSize: 48,
    //     textAlign: "center",
    //     editable: false,
    //     lockMovementX: true,
    //     lockMovementY: true,
    //     selectable: false, // Prevent accidental selection
    //   });
    //   canvas.add(fixedTextElement);
    //   canvas.bringObjectToFront(fixedTextElement);;

    const insideTextElement = new fabric.Textbox("Your Greeting Here", {
        top: canvas.height! / 2 - 150,
        width: canvas.width! ,
        fontSize: parseInt(selectedFontSize, 10),
        fill: "#111111",
        textAlign: "center",
        editable: true,
        lockMovementX: true,
        lockMovementY: false,
        selectable: true, // Prevent accidental selection
      });

    insideCanvas.add(insideTextElement);


    // Add a placeholder text element (fixed but editable)
    const textElement = new fabric.Textbox("Your Greeting Here", {
      top: canvas.height! / 2 - 150,
      padding: 10,
      width: canvas.width! ,
      fontFamily: "Pacifico",
      fontSize: 28,
      backgroundColor: "#090b4d",
      fill: "#ffffff",
      textAlign: "center",
      editable: true,
      lockMovementX: true,
      lockMovementY: true,
      selectable: true, // Prevent accidental selection
    });
    canvas.add(textElement);
    canvas.bringObjectToFront(textElement);

    // Clean up on component unmount
    return () => {
      canvas.dispose();
      insideCanvas.dispose();
    };
  }, []);

    // Handle switching between canvases
    const switchToInside = () => {
        setIsFrontVisible(false);
    };

    const switchToFront = () => {
        setIsFrontVisible(true);
    };



  const handleAddImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (!imageUrl) {
        console.error("Failed to read the file.");
        return;
      }

      const canvas = frontCanvasRef.current;
      if (!canvas) {
        console.error("Canvas is not initialized.");
        return;
      }

      // Create an HTML image element
      const imgElement = new Image();
      imgElement.src = imageUrl;
      imgElement.crossOrigin = "anonymous"; // Fix for cross-origin issues

      imgElement.onload = () => {
        const img = new fabric.FabricImage(imgElement);

        // Scale the image to fit the canvas
        const scaleX = canvas.width! / img.width!;
        const scaleY = canvas.height! / img.height!;
        const scale = Math.min(scaleX, scaleY);

        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          selectable: true,
        });

        // Add the image to the canvas
        canvas.add(img);
        canvas.sendObjectToBack(img);;
        canvas.renderAll();
        console.log("Image added to the canvas successfully.");
      };

      imgElement.onerror = () => {
        console.error("Failed to load the image.");
      };
    };

    reader.onerror = () => {
      console.error("Error reading the file.");
    };

    reader.readAsDataURL(file);
  };

  const handleExportJSON = () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) {
      console.error("Canvas is not initialized.");
      return;
    }

    setCardJson(JSON.stringify(canvas.toJSON()));
  };

  const handleLoadProgress = () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) {
      console.error("Canvas is not initialized.");
      return;
    }

    const textbox = document.getElementById("loadProgressTextbox") as HTMLTextAreaElement;
    if (!textbox) {
      console.error("Textarea not found.");
      return;
    }

    const json = textbox.value;
    if (!json) {
      console.error("No JSON data found.");
      return;
    }

    canvas.loadFromJSON(json, () => {
      canvas.requestRenderAll();
      console.log("Progress loaded successfully.");
    });
  };

  const handleExportPDF = () => {
    const canvas = frontCanvasRef.current;
    const insideCanvas = insideCanvasRef.current;

    if (!canvas) {
      console.error("Canvas is not initialized.");
      return;
    }

    if (!insideCanvas) {
        console.error("Canvas is not initialized.");
        return;
      }

    let originalTransform = canvas.viewportTransform;
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.viewportTransform = originalTransform;

    originalTransform = insideCanvas.viewportTransform;
    insideCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    insideCanvas.viewportTransform = originalTransform;

    // Export the canvas as a base64 image
    const imageData = canvas.toDataURL({
      format: "png",
      multiplier: 4, // Higher multiplier for better resolution
    });

    const insideImageData = insideCanvas.toDataURL({
        format: "png",
        multiplier: 4, // Higher multiplier for better resolution
      });

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: "landscape", // Landscape orientation
      unit: "px", // Use pixels as the unit
      format: [(canvas.width! * 2), canvas.height!], // Match canvas dimensions
    });

    // Add the image to the PDF
    pdf.addImage(imageData, "PNG", canvas.width!, 0, canvas.width!, canvas.height!);

    pdf.addPage();
    pdf.addImage(insideImageData, "PNG", 0, 0, insideCanvas.width!, insideCanvas.height!);

    // Save the PDF
    pdf.save("greeting_card.pdf");
  };

// Function to handle font change
const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = event.target.value;
    setSelectedFont(newFont);
    // Apply the font to the selected text object
    const canvas = frontCanvasRef.current;
    if (canvas) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
        activeObject.set("fontFamily", newFont);
        canvas.requestRenderAll();
    }
    }
    };


    // Function to handle font change
const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = event.target.value;
    setSelectedFontSize(newSize);
    // Apply the font to the selected text object
    const canvas = insideCanvasRef.current;
    if (canvas) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
        activeObject.set("fontSize", newSize);
        canvas.requestRenderAll();
    }
    }
    };

  return (
    <div>

      <div className="controls">
      <h2>Product Customisation Service</h2>
      <button onClick={switchToInside} disabled={!isFrontVisible}>
        Switch to Inside
      </button>
      <button onClick={switchToFront} disabled={isFrontVisible}>
        Switch to Front
      </button>
      <select value={selectedFont} onChange={handleFontChange}>
        <option value="Pacifico">Pacifico</option>
        <option value="VT323">VT323</option>
      </select>

      <select value={selectedFontSize} onChange={handleFontSizeChange}>
        <option value="22">22</option>
        <option value="24">24</option>
        <option value="32">32</option>s
        <option value="48">48</option>
      </select>

      <input type="file" accept="image/*" onChange={handleAddImage} />

      <textarea id="loadProgressTextbox" placeholder="JSON here..." />
      <button onClick={handleLoadProgress}>Load Progress</button>
      </div>
    <div className={`flip-container ${!isFrontVisible ? 'flipped' : ''}`}>
        <div className="flip-card">
            <div className="flip-front">
            <canvas id="greetingCardFrontCanvas" />
            </div>
            <div className="flip-back">
            <canvas id="greetingCardInsideCanvas" />
            </div>
        </div>
    </div>
    <div className="bottom-controls">
      <button onClick={handleExportPDF}>Generate PDF</button>
      <button onClick={handleExportJSON}>Save Progress</button>

      <p>{cardJson}</p>
    </div>
    </div>
  );
};

export default GreetingCardEditor;
