/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon, Wand2, Download, Zap, Layers, Clock, X, Maximize2, Monitor, Smartphone, Square } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const STYLES = ['Realistic', 'Anime', 'Fantasy', '3D', 'Cyberpunk', 'Minimalist'];

const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1', icon: Square },
  { label: '16:9', value: '16:9', icon: Monitor },
  { label: '9:16', value: '9:16', icon: Smartphone },
];

type GeneratedImage = {
  url: string;
  prompt: string;
  style: string;
  time?: string;
  aspectRatio?: string;
};

const getContainerMaxWidth = (ar: string) => {
  if (ar === '16:9') return 'max-w-3xl';
  if (ar === '9:16') return 'max-w-sm';
  return 'max-w-xl';
};

const getAspectClass = (ar: string) => {
  if (ar === '16:9') return 'aspect-video';
  if (ar === '9:16') return 'aspect-[9/16]';
  return 'aspect-square';
};

const INITIAL_IMAGES: GeneratedImage[] = [
  { url: 'https://picsum.photos/seed/cyberpunk1/800/800', prompt: 'Neon lit futuristic city street...', style: 'Cyberpunk' },
  { url: 'https://picsum.photos/seed/neoncity/800/800', prompt: 'Flying cars in a green neon metropolis...', style: '3D' },
  { url: 'https://picsum.photos/seed/matrix/800/800', prompt: 'Digital rain falling over a dark hacker room...', style: 'Realistic' },
  { url: 'https://picsum.photos/seed/futuretech/800/800', prompt: 'Advanced AI core glowing with green energy...', style: 'Minimalist' },
  { url: 'https://picsum.photos/seed/greenhologram/800/800', prompt: 'Holographic display projecting a planet...', style: 'Fantasy' },
  { url: 'https://picsum.photos/seed/darkai/800/800', prompt: 'Dark robotic figure with glowing green eyes...', style: 'Anime' },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [generationTime, setGenerationTime] = useState<string | null>(null);
  const [latestImage, setLatestImage] = useState<GeneratedImage | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleDownload = async (url: string, filename: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Download failed:", error);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenerationTime(null);
    const startTime = performance.now();

    // Scroll to the placeholder/loading box immediately
    setTimeout(() => {
      document.getElementById('latest-result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const fullPrompt = `${prompt}, ${selectedStyle} style`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        }
      });

      let base64Image = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      const endTime = performance.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(1);

      if (base64Image) {
        setGenerationTime(`${timeTaken}s`);
        
        const newImage = {
          url: base64Image,
          prompt: prompt,
          style: selectedStyle,
          time: `${timeTaken}s`,
          aspectRatio: aspectRatio
        };
        
        setLatestImage(newImage);
        
        // Scroll to the latest result to show the new image
        setTimeout(() => {
          document.getElementById('latest-result')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error("No image data returned from the model.");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans selection:bg-neon-green/30 selection:text-neon-green">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-dark-bg"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        
        {/* Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[100px] opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-6xl flex flex-col items-center">
        
        {/* Header / Nav */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col md:flex-row justify-between items-center mb-16 gap-6"
        >
          <div className="flex items-center gap-2 text-neon-green font-display font-bold text-xl tracking-wider">
            <Zap className="w-6 h-6" />
            <span>PROMPTIFLY AI</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-400 bg-dark-panel/50 backdrop-blur-md px-6 py-3 rounded-full border border-neon-green/10">
            <a href="#generate" className="hover:text-neon-green transition-colors">Generate</a>
            <a href="#how-it-works" className="hover:text-neon-green transition-colors">How it Works</a>
            <a href="#gallery" className="hover:text-neon-green transition-colors">Image Gallery</a>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-3xl mb-16 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-green/30 bg-neon-green/5 text-neon-green text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen AI Vision Model</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
            Create Stunning Images with <span className="text-neon-green neon-text-glow">Just a Prompt</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl">
            Turn your ideas into high-quality visuals in seconds, no design skills needed. Experience the future of creation.
          </p>
        </motion.div>

        {/* Generator Interface */}
        <motion.div 
          id="generate"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-4xl glass-panel p-6 md:p-8 mb-24 neon-glow scroll-mt-24"
        >
          <div className="flex flex-col gap-6">
            {/* Prompt Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Wand2 className="w-6 h-6 text-neon-green/70" />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image..."
                className="w-full bg-black/40 border border-neon-green/30 rounded-xl py-5 pl-14 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Selectors */}
              <div className="flex-1 w-full flex flex-col gap-5">
                {/* Style Selector */}
                <div>
                  <p className="text-sm text-gray-400 mb-3 font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Style
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                          selectedStyle === style
                            ? 'bg-neon-green/20 border-neon-green text-neon-green neon-glow'
                            : 'bg-black/40 border-gray-800 text-gray-400 hover:border-neon-green/50 hover:text-gray-200'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <p className="text-sm text-gray-400 mb-3 font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> Aspect Ratio
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.value}
                        onClick={() => setAspectRatio(ar.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border flex items-center gap-2 ${
                          aspectRatio === ar.value
                            ? 'bg-neon-green/20 border-neon-green text-neon-green neon-glow'
                            : 'bg-black/40 border-gray-800 text-gray-400 hover:border-neon-green/50 hover:text-gray-200'
                        }`}
                      >
                        <ar.icon className="w-4 h-4" />
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button & Time */}
              <div className="flex flex-col items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full px-8 py-4 bg-neon-green text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:bg-neon-green-dark hover:neon-glow-strong disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neon-green disabled:hover:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Create Image
                    </>
                  )}
                </button>
                
                {generationTime && !isGenerating && (
                  <div className="flex items-center gap-1.5 text-neon-green text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Generated in {generationTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Latest Generated Image Space */}
        <motion.div
          id="latest-result"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full mb-24 scroll-mt-24 mx-auto transition-all duration-500 ${getContainerMaxWidth(isGenerating ? aspectRatio : (latestImage?.aspectRatio || aspectRatio))}`}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Your Creation</h2>
            <p className="text-gray-400">
              {isGenerating ? "Creating your image..." : latestImage ? "Click the image to view in full screen." : "Your generated masterpiece will be displayed below."}
            </p>
          </div>
          
          {isGenerating ? (
            <div className={`relative rounded-2xl overflow-hidden glass-panel border-neon-green/50 flex flex-col items-center justify-center text-neon-green bg-black/40 neon-glow transition-all duration-500 ${getAspectClass(aspectRatio)}`}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="mb-4"
              >
                <Sparkles className="w-16 h-16" />
              </motion.div>
              <p className="text-lg font-medium animate-pulse">Generating your masterpiece...</p>
            </div>
          ) : latestImage ? (
            <div 
              className={`relative group rounded-2xl overflow-hidden glass-panel border-neon-green/50 cursor-pointer transition-all duration-500 ${getAspectClass(latestImage.aspectRatio || '1:1')}`}
              onClick={() => setFullscreenImage(latestImage.url)}
            >
              <img 
                src={latestImage.url} 
                alt="Latest generated artwork" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md border border-white/10">
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-sm font-medium">View Fullscreen</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-neon-green text-sm font-medium">{latestImage.style}</p>
                      {latestImage.time && (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {latestImage.time}
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm">{latestImage.prompt}</p>
                  </div>
                  <button 
                    onClick={(e) => handleDownload(latestImage.url, 'promptifly-creation.png', e)}
                    className="w-10 h-10 shrink-0 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center backdrop-blur-md hover:bg-neon-green hover:text-black transition-colors"
                    title="Download Image"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`relative rounded-2xl overflow-hidden glass-panel border-dashed border-2 border-gray-700 flex flex-col items-center justify-center text-gray-500 bg-black/20 transition-all duration-500 ${getAspectClass(aspectRatio)}`}>
              <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">The generated image will appear here</p>
            </div>
          )}
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          id="how-it-works"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full mb-32 scroll-mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to bring your imagination to life.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Wand2, title: 'Enter your prompt', desc: 'Describe what you want to see in detail.' },
              { icon: Layers, title: 'Choose a style', desc: 'Select from our curated list of artistic styles.' },
              { icon: Sparkles, title: 'Generate your image', desc: 'Watch our AI create your masterpiece in seconds.' }
            ].map((step, i) => (
              <div key={i} className="glass-panel p-8 text-center flex flex-col items-center group hover:border-neon-green/50 transition-colors duration-300">
                <div className="w-16 h-16 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-6 group-hover:neon-glow transition-all duration-300">
                  <step.icon className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Image Gallery */}
        <motion.div 
          id="gallery"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full scroll-mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Image Gallery</h2>
            <p className="text-gray-400">Explore recent creations generated by Promptifly AI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group rounded-2xl overflow-hidden glass-panel aspect-square border-gray-800 hover:border-neon-green/50 transition-all duration-500 cursor-pointer"
                onClick={() => setFullscreenImage(img.url)}
              >
                <img 
                  src={img.url} 
                  alt={`Generated artwork ${i + 1}`} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-neon-green text-sm font-medium">{img.style}</p>
                        {img.time && (
                          <span className="text-gray-400 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {img.time}
                          </span>
                        )}
                      </div>
                      <p className="text-white text-sm line-clamp-2 leading-relaxed">{img.prompt}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDownload(img.url, `promptifly-${i}.png`, e)}
                      className="w-10 h-10 shrink-0 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center backdrop-blur-md hover:bg-neon-green hover:text-black transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="w-full mt-32 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Promptifly AI. All rights reserved.</p>
        </footer>

      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setFullscreenImage(null)}
          >
            <div className="absolute top-6 right-6 flex items-center gap-4 z-[101]">
              <button
                className="w-12 h-12 bg-black/50 hover:bg-neon-green text-white hover:text-black rounded-full flex items-center justify-center transition-colors border border-gray-700 hover:border-neon-green"
                onClick={(e) => handleDownload(fullscreenImage, 'promptifly-fullscreen.png', e)}
                title="Download Image"
              >
                <Download className="w-6 h-6" />
              </button>
              <button
                className="w-12 h-12 bg-black/50 hover:bg-neon-green text-white hover:text-black rounded-full flex items-center justify-center transition-colors border border-gray-700 hover:border-neon-green"
                onClick={() => setFullscreenImage(null)}
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullscreenImage}
              alt="Fullscreen generated"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-neon-green/20"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
