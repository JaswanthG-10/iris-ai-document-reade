import React, { useRef, useEffect } from "react";
import type { Document } from "../../types";


interface KnowledgeGraphProps {
  documents: Document[];
  citedDocIds?: number[]; // IDs of documents cited in active chat answer
}

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  type: "document" | "chunk";
  parentDocId?: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ documents, citedDocIds = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Set dimensions
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize graph nodes: Document nodes + child chunk nodes cluster
    const nodes: Node[] = [];
    const center = { x: canvas.width / 2, y: canvas.height / 2 };

    documents.forEach((doc, idx) => {
      // Place document nodes in a slow concentric ring orbit
      const dist = 100 + (idx * 35);
      const angle = (idx / documents.length) * Math.PI * 2;
      const docNode: Node = {
        id: doc.id,
        label: doc.display_name,
        x: center.x + Math.cos(angle) * dist,
        y: center.y + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: doc.status === "Ready" ? 6 : 4,
        color: doc.status === "Ready" ? "#00E5FF" : "#EF4444", // Cyan if indexed, Red if failed
        orbitRadius: dist,
        orbitSpeed: 0.0003 + (Math.random() * 0.0003),
        angle: angle,
        type: "document"
      };
      nodes.push(docNode);

      // Create 3 orbiting chunk nodes per ready document representing sub-embeddings density
      if (doc.status === "Ready") {
        for (let c = 0; c < 3; c++) {
          const chunkAngle = (c / 3) * Math.PI * 2;
          nodes.push({
            id: -100 - (doc.id * 10) - c, // negative virtual ID
            label: `Chunk ${c}`,
            x: docNode.x + Math.cos(chunkAngle) * 20,
            y: docNode.y + Math.sin(chunkAngle) * 20,
            vx: 0,
            vy: 0,
            radius: 2,
            color: "rgba(99, 102, 241, 0.4)", // Muted Indigo
            orbitRadius: 20,
            orbitSpeed: 0.005 + (Math.random() * 0.005),
            angle: chunkAngle,
            type: "chunk",
            parentDocId: doc.id
          });
        }
      }
    });

    nodesRef.current = nodes;

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      const currentCenter = { x: canvas.width / 2, y: canvas.height / 2 };

      // Pre-evaluate prefersReducedMotion to block kinetic drift physics
      if (!prefersReducedMotion) {
        // 1. Slow orbit physics movement
        nodesRef.current.forEach((n) => {
          if (n.type === "document") {
            n.angle += n.orbitSpeed;
            n.x = currentCenter.x + Math.cos(n.angle) * n.orbitRadius + Math.sin(time * 0.002 + n.id) * 3;
            n.y = currentCenter.y + Math.sin(n.angle) * n.orbitRadius + Math.cos(time * 0.002 + n.id) * 3;
          } else if (n.type === "chunk") {
            // Find parent document node coordinate
            const parent = nodesRef.current.find((p) => p.id === n.parentDocId);
            if (parent) {
              n.angle += n.orbitSpeed;
              n.x = parent.x + Math.cos(n.angle) * n.orbitRadius;
              n.y = parent.y + Math.sin(n.angle) * n.orbitRadius;
            }
          }
        });
      }

      // 2. Draw Connection Edges
      nodesRef.current.forEach((n) => {
        if (n.type === "chunk") {
          const parent = nodesRef.current.find((p) => p.id === n.parentDocId);
          if (parent) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(parent.x, parent.y);
            ctx.strokeStyle = "rgba(99, 102, 241, 0.12)"; // Faint connecting edge
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      // 3. Draw Nodes
      nodesRef.current.forEach((n) => {
        const isCited = n.type === "document" && citedDocIds.includes(n.id);
        const isChildOfCited = n.type === "chunk" && n.parentDocId !== undefined && citedDocIds.includes(n.parentDocId);

        // Cited elements glow cyan/indigo with higher diameter
        if (isCited) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isCited 
          ? "#00E5FF" 
          : isChildOfCited 
            ? "rgba(0, 229, 255, 0.8)" 
            : n.color;
        ctx.fill();

        // Label display for document nodes
        if (n.type === "document") {
          ctx.fillStyle = isCited ? "#00E5FF" : "rgba(156, 163, 175, 0.6)";
          ctx.font = isCited ? "bold 10px Outfit" : "9px Outfit";
          ctx.fillText(
            n.label.length > 15 ? n.label.slice(0, 15) + "..." : n.label,
            n.x + 10,
            n.y + 3
          );
        }
      });

      // 4. Trace beams: Query to source chunks (Retrieval trace visualization)
      if (citedDocIds.length > 0) {
        citedDocIds.forEach((citedId) => {
          const target = nodesRef.current.find((n) => n.id === citedId);
          if (target) {
            // Draw a pulsing cyan energy beam representing context retrieval path
            ctx.beginPath();
            ctx.moveTo(currentCenter.x, currentCenter.y);
            ctx.lineTo(target.x, target.y);
            
            const gradient = ctx.createLinearGradient(currentCenter.x, currentCenter.y, target.x, target.y);
            gradient.addColorStop(0, "rgba(99, 102, 241, 0.05)");
            gradient.addColorStop(0.5, `rgba(0, 229, 255, ${0.1 + Math.sin(time * 0.15) * 0.08})`);
            gradient.addColorStop(1, "rgba(0, 229, 255, 0.5)");

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5 + Math.sin(time * 0.1) * 0.5;
            ctx.stroke();

            // Floating query particle pulse along the beam path
            const progress = (time * 0.005) % 1.0;
            const px = currentCenter.x + (target.x - currentCenter.x) * progress;
            const py = currentCenter.y + (target.y - currentCenter.y) * progress;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#00E5FF";
            ctx.fill();
          }
        });

        // Draw central Query Node (Ambient glowing indigo sphere)
        ctx.beginPath();
        ctx.arc(currentCenter.x, currentCenter.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(currentCenter.x, currentCenter.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#6366F1";
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [documents, citedDocIds]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
export default KnowledgeGraph;
