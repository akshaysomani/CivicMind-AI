import React, { useCallback, useRef, useState } from 'react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  uploadProgress?: number; // 0-100, shown during actual upload
}

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string): string {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎥';
  if (mime.includes('pdf')) return '📄';
  return '📎';
}

const MediaUploader: React.FC<Props> = ({
  files,
  onChange,
  maxFiles = 6,
  maxSizeMB = 10,
  uploadProgress,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);

  // Validate incoming files
  const validate = useCallback((newFiles: File[], isReplacement = false): File[] => {
    const errs: string[] = [];
    const valid: File[] = [];
    const current = files.length;

    for (const f of newFiles) {
      // Skip file count check if we are replacing an existing file
      if (!isReplacement && current + valid.length >= maxFiles) {
        errs.push(`Maximum ${maxFiles} files allowed.`);
        break;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        errs.push(`"${f.name}" exceeds the ${maxSizeMB}MB file size limit.`);
        continue;
      }
      valid.push(f);
    }
    setErrors(errs);
    return valid;
  }, [files, maxFiles, maxSizeMB]);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const valid = validate(arr);
    if (valid.length) onChange([...files, ...valid]);
  }, [files, onChange, validate]);

  const removeFile = useCallback((idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  }, [files, onChange]);

  // Handle replacing a specific file
  const triggerReplace = useCallback((idx: number) => {
    setReplacingIdx(idx);
    replaceInputRef.current?.click();
  }, []);

  const handleReplaceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (replacingIdx === null || !e.target.files || e.target.files.length === 0) return;
    const newFile = e.target.files[0];
    const valid = validate([newFile], true);
    if (valid.length) {
      const updated = [...files];
      updated[replacingIdx] = valid[0];
      onChange(updated);
    }
    setReplacingIdx(null);
    e.target.value = '';
  }, [files, replacingIdx, onChange, validate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const previews = files.map(f => ({
    name: f.name,
    size: formatSize(f.size),
    icon: getFileIcon(f.type),
    isImage: f.type.startsWith('image/'),
    url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    mime: f.type,
  }));

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload files by clicking or dragging"
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
            : files.length >= maxFiles
              ? 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
              : 'border-slate-600 bg-slate-800/30 hover:border-blue-500 hover:bg-blue-500/5'
          }
        `}
      >
        {/* standard file input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={e => addFiles(e.target.files)}
          disabled={files.length >= maxFiles}
          aria-label="File upload input"
        />
        
        {/* hidden replace file input */}
        <input
          ref={replaceInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleReplaceChange}
          aria-label="File replacement input"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${isDragging ? 'bg-blue-500/20 scale-110' : 'bg-slate-700/60'}`}>
            {isDragging ? '📂' : '☁️'}
          </div>
          <div>
            <p className="text-slate-300 font-medium">
              {isDragging ? 'Drop files here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Supports Images, Videos, or Documents (Max {maxSizeMB}MB each)
            </p>
          </div>
        </div>
      </div>

      {/* Geolocation/Mobile Native Camera Capture Trigger */}
      <div className="flex gap-2">
        <button
          type="button"
          id="btn-upload-camera"
          onClick={() => cameraInputRef.current?.click()}
          disabled={files.length >= maxFiles}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold bg-slate-800/50 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📷 Take Photo / Video (Camera)
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={e => addFiles(e.target.files)}
          disabled={files.length >= maxFiles}
          aria-label="Mobile camera upload"
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-red-400 text-xs flex items-center gap-1.5 bg-red-500/5 border border-red-500/10 p-2 rounded-lg">
              <span>⚠️</span> {e}
            </p>
          ))}
        </div>
      )}

      {/* Upload Progress Bar */}
      {typeof uploadProgress === 'number' && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Uploading to server…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-750 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File Previews & Management Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((p, idx) => (
            <div
              key={idx}
              className="group relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800/40 transition-all hover:border-slate-500"
            >
              {/* Preview Rendering */}
              {p.isImage && p.url ? (
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-24 object-cover"
                  onLoad={() => URL.revokeObjectURL(p.url!)}
                />
              ) : (
                <div className="w-full h-24 flex flex-col items-center justify-center gap-1 bg-slate-700/20">
                  <span className="text-3xl">{p.icon}</span>
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    {p.mime.split('/')[1]?.toUpperCase() || 'FILE'}
                  </span>
                </div>
              )}

              {/* File Info */}
              <div className="p-2 bg-slate-900/60 backdrop-blur-sm border-t border-slate-850">
                <p className="text-slate-300 text-xs font-semibold truncate" title={p.name}>{p.name}</p>
                <p className="text-slate-500 text-[10px]">{p.size}</p>
              </div>

              {/* Action Buttons overlay on hover */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  id={`btn-replace-${idx}`}
                  onClick={() => triggerReplace(idx)}
                  className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold shadow-md transition-colors"
                >
                  🔄 Replace
                </button>
                <button
                  type="button"
                  id={`btn-remove-${idx}`}
                  onClick={() => removeFile(idx)}
                  className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold shadow-md transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Production Scaling: Ready for Cloud Storage (GCS)
          Implementation Note for GCP Cloud Solutions Architects:
          To link this directly to GCS buckets:
          1. Replace standard FastAPI endpoint with direct signed URL uploads to GCS:
             `GET /api/v1/issues/signed-url?filename={name}`
          2. Perform client-side PUT directly to the GCS signed URL bucket to optimize upload bandwidth.
          3. Save public URL referencing the GCS resource to SQLite 'attachments' model database fields.
      */}
    </div>
  );
};

export default MediaUploader;
