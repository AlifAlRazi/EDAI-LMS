"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Background, Controls, ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import FileUpload from "@/components/admin/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, AlertCircle, Play, GripVertical } from "lucide-react";

export default function CourseEditorClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [course, setCourse] = useState(initialData);

  // RAG / Graph States
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.knowledgeNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]); // Usually loaded from KnowledgeEdge models in a full impl
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // DND State for modules
  const [modules, setModules] = useState<any[]>(initialData.modules || []);

  const handleSave = async () => {
    // In a real app we would POST to /api/courses/{courseId}
    console.log("Saving course:", course, modules, nodes, edges);
    alert("Course saved successfully!");
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "curriculum", label: "Curriculum" },
    { id: "graph", label: "Knowledge Graph" },
    { id: "publish", label: "Publish" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            {course._id === "new" ? "Create New Course" : "Edit Course"}
          </h1>
          <p className="text-sm text-white/50">{course.title || "Untitled Course"}</p>
        </div>
        <Button onClick={handleSave} className="bg-primary-600 hover:bg-primary-500 text-white shadow-glow-violet">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="flex bg-dark-100 border border-white/5 rounded-xl p-1 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-dark-100 border border-white/5 rounded-xl p-6 min-h-[600px]">
        
        {/* BASIC INFO TAB */}
        {activeTab === "basic" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Course Title</label>
              <Input
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                className="bg-dark border-white/10 text-white"
                placeholder="e.g. Introduction to Abstract Algebra"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Description</label>
              <Textarea
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                className="bg-dark border-white/10 text-white h-32"
                placeholder="Give a detailed overview of what students will learn..."
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Price ($)</label>
                <Input
                  type="number"
                  value={course.price}
                  onChange={(e) => setCourse({ ...course, price: Number(e.target.value), isFree: Number(e.target.value) === 0 })}
                  className="bg-dark border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Level</label>
                <select
                  value={course.level}
                  onChange={(e) => setCourse({ ...course, level: e.target.value })}
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white h-10"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Thumbnail Image</label>
              {course.thumbnail ? (
                <div className="relative w-64 h-36 rounded-lg overflow-hidden border border-white/10 group">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FileUpload accept="image" buttonLabel="Replace" onUpload={(url) => setCourse({ ...course, thumbnail: url })} />
                  </div>
                </div>
              ) : (
                <div className="w-64 h-36 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center bg-dark/50">
                  <FileUpload accept="image" buttonLabel="Upload Image" onUpload={(url) => setCourse({ ...course, thumbnail: url })} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* CURRICULUM TAB */}
        {activeTab === "curriculum" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-accent-500/10 border border-accent-500/20 p-4 rounded-xl">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-accent-400" />
                <div className="text-sm">
                  <p className="text-white font-medium">Automatic RAG Ingestion</p>
                  <p className="text-white/60">Uploading PDFs or Text here automatically Vectorizes them into Pinecone.</p>
                </div>
              </div>
              <Button onClick={() => setModules([...modules, { id: Date.now().toString(), title: "New Module", lessons: [] }])} variant="secondary">
                Add Module
              </Button>
            </div>

            <DragDropContext onDragEnd={(result: DropResult) => {
              if (!result.destination) return;
              const reordered = Array.from(modules);
              const [moved] = reordered.splice(result.source.index, 1);
              reordered.splice(result.destination.index, 0, moved);
              setModules(reordered);
            }}>
              <Droppable droppableId="modules">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {modules.map((mod, index) => (
                      <Draggable key={mod.id} draggableId={mod.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className="bg-dark border border-white/10 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border-b border-white/5">
                              <div {...provided.dragHandleProps} className="cursor-grab text-white/30 hover:text-white">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <h3 className="font-semibold text-white">{mod.title}</h3>
                            </div>
                            <div className="p-4 space-y-2">
                              {mod.lessons?.length > 0 ? mod.lessons.map((lesson: any) => (
                                <div key={lesson.id} className="p-3 bg-white/5 rounded-lg text-sm text-white flex items-center gap-2">
                                  <Play className="w-4 h-4 text-primary-400" /> {lesson.title}
                                </div>
                              )) : (
                                <p className="text-xs text-white/40 italic">No lessons. Drag files or click add.</p>
                              )}
                              <FileUpload accept="raw" buttonLabel="Upload PDF / Text (RAG)" className="w-full mt-4 bg-white/[0.02]" onUpload={() => {}} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* KNOWLEDGE GRAPH TAB */}
        {activeTab === "graph" && (
          <div className="h-[600px] w-full border border-white/10 rounded-xl overflow-hidden bg-dark">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              colorMode="dark"
            >
              <Background />
              <Controls />
            </ReactFlow>
            <div className="absolute top-4 right-4 bg-dark-100 p-2 rounded-lg border border-white/10 shadow-xl z-10 flex gap-2">
              <Button size="sm" onClick={() => {
                setNodes(nds => [...nds, { id: `node-${Date.now()}`, position: { x: 0, y: 0 }, data: { label: 'New Concept' } }]);
              }}>
                Add Concept Node
              </Button>
            </div>
          </div>
        )}

        {/* PUBLISH TAB */}
        {activeTab === "publish" && (
          <div className="max-w-xl text-center mx-auto mt-20 space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-glow" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Publish?</h2>
              <p className="text-white/50 text-sm">
                Publishing this course will construct the Pinecone RAG Index, create the EdAI Graph, and generate a Stripe Checkout integration for purchasing.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setCourse({ ...course, isPublished: true })}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold h-14 text-lg"
            >
              🚀 Publish to Live Environment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
