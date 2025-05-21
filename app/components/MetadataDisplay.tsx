import { Copy, Check, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetadataDisplayProps {
  metadata: any;
}

export default function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  const [keywordsCopied, setKeywordsCopied] = useState(false);
  const [descriptionCopied, setDescriptionCopied] = useState(false);
  const [categoriesCopied, setCategoriesCopied] = useState(false);

  if (!metadata) return null;

  const copyToClipboard = (
    text: string,
    setCopiedState: (copied: boolean) => void
  ) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="mt-8 bg-slate-900/70 border-slate-700/50 shadow-2xl backdrop-blur-sm text-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-cyan-400 tracking-wide">
            Asset Intel Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {metadata.preview && (
            <div className="border border-slate-700/80 rounded-lg overflow-hidden shadow-lg">
              {/* <h3 className="text-xs font-medium text-slate-400 mb-1 px-3 pt-2 uppercase tracking-wider">Visual Matrix</h3> */}
              <div className="relative bg-slate-950/70 p-2 flex justify-center items-center min-h-[200px]">
                <img
                  src={metadata.preview}
                  alt="Asset preview"
                  className="max-w-full h-auto max-h-[450px] rounded-md shadow-2xl"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {metadata.type && (
              <div>
                <h3 className="text-xs font-semibold text-sky-400 mb-1.5 uppercase tracking-wider">
                  Classification
                </h3>
                <Badge
                  variant="secondary"
                  className="text-sm px-3.5 py-1.5 bg-sky-600/30 hover:bg-sky-500/40 text-sky-200 border-sky-500/50 shadow-md"
                >
                  {metadata.type.charAt(0).toUpperCase() +
                    metadata.type.slice(1)}
                </Badge>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-purple-400 mb-1.5 uppercase tracking-wider">
                Originator
              </h3>
              {metadata.contributor ? (
                <a
                  href={`https://www.shutterstock.com/g/${encodeURIComponent(
                    metadata.contributor.toLowerCase().replace(/\s+/g, "-")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    variant="outline"
                    className="text-sm px-3.5 py-1.5 border-purple-500/50 bg-purple-600/20 hover:bg-purple-500/30 
                                                   text-purple-200 group shadow-md"
                  >
                    <UserCircle
                      size={16}
                      className="mr-2 text-purple-300 group-hover:text-purple-200 transition-colors"
                    />
                    {metadata.contributor}
                  </Badge>
                </a>
              ) : (
                <Badge
                  variant="outline"
                  className="text-sm px-3.5 py-1.5 bg-slate-700/50 border-slate-600 text-slate-400 shadow-md"
                >
                  <UserCircle size={16} className="mr-2 text-slate-500" />
                  N/A
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex justify-between items-center">
              <span>Asset Description Log</span>
              {metadata.description && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          metadata.description,
                          setDescriptionCopied
                        )
                      }
                      className="h-7 w-7 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/20"
                    >
                      {descriptionCopied ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-slate-800 text-slate-200 border-slate-700"
                  >
                    <p>
                      {descriptionCopied
                        ? "Log Copied!"
                        : "Copy Description Log"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </h3>
            <div className="mt-1 bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-md shadow">
              <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                {metadata.description || "No description log available."}
              </p>
            </div>
          </div>

          {metadata.keywords && metadata.keywords.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex justify-between items-center">
                <span>Data Tags (Keywords)</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          metadata.keywords.join(", "),
                          setKeywordsCopied
                        )
                      }
                      className="h-7 w-7 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/20"
                    >
                      {keywordsCopied ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-slate-800 text-slate-200 border-slate-700"
                  >
                    <p>
                      {keywordsCopied ? "Tags Copied!" : "Copy All Data Tags"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-2.5">
                {metadata.keywords.map((keyword: string) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="text-xs px-3 py-1 bg-slate-700/80 hover:bg-slate-600/90 text-slate-300 border-slate-600/70 shadow"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {metadata.categories && metadata.categories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex justify-between items-center">
                <span>Sector Allocation (Categories)</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          metadata.categories.join(", "),
                          setCategoriesCopied
                        )
                      }
                      className="h-7 w-7 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/20"
                    >
                      {categoriesCopied ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-slate-800 text-slate-200 border-slate-700"
                  >
                    <p>
                      {categoriesCopied
                        ? "Sectors Copied!"
                        : "Copy All Sectors"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-2.5">
                {metadata.categories.map((category: string) => (
                  <Badge
                    key={category}
                    className="text-xs px-3 py-1 bg-teal-600/80 hover:bg-teal-500/80 text-teal-100 border-teal-500/70 shadow"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
