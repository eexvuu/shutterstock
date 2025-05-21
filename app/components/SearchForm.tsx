import { History, X, Search, Trash2, Settings2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent /*CardHeader, CardTitle*/,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SearchFormProps {
  url: string;
  setUrl: (url: string) => void;
  isLoading: boolean;
  handleSubmit: (event: React.FormEvent, forceUrl?: string) => void;
  searchHistory: string[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  handleHistoryItemClick: (historyUrl: string) => void;
  clearHistory: () => void;
  removeHistoryItem: (urlToRemove: string) => void;
}

export default function SearchForm({
  url,
  setUrl,
  isLoading,
  handleSubmit,
  searchHistory,
  setShowHistory,
  handleHistoryItemClick,
  clearHistory,
  removeHistoryItem,
}: SearchFormProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleHistorySelection = (historyUrl: string) => {
    handleHistoryItemClick(historyUrl);
    setPopoverOpen(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="bg-slate-900/70 border-slate-700/50 shadow-2xl backdrop-blur-sm">
        {/* <CardHeader>
                    <CardTitle className="text-xl text-cyan-400">Initiate Scan</CardTitle>
                </CardHeader> */}
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="shutterstockUrl"
                className="block mb-2 text-sm font-medium text-sky-300 tracking-wider"
              >
                Target Asset URL (Shutterstock):
              </label>
              {/* Main container for input and buttons, stacks on mobile */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Group for Input + History Button */}
                <div className="flex items-center gap-2 flex-grow">
                  <Input
                    type="text"
                    id="shutterstockUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste Shutterstock URL here... e.g., https://www.shutterstock.com/image-..."
                    required
                    className="flex-1 bg-slate-800/60 border-slate-700 placeholder:text-slate-500 
                                                   focus:border-cyan-500 focus:ring-cyan-500 text-slate-100 py-2.5 px-4 text-base"
                  />
                  {searchHistory.length > 0 && (
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Access Scan History"
                              className="border-slate-600 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 
                                                                       bg-slate-800/60 hover:bg-slate-700/80 p-2.5 transition-colors duration-200"
                            >
                              <History size={22} />
                            </Button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="bg-slate-800 text-slate-200 border-slate-700"
                        >
                          <p>Scan History</p>
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent
                        className="w-[calc(100vw-5rem)] sm:w-[550px] p-0 bg-slate-800/95 border-slate-700/70 backdrop-blur-md shadow-2xl text-slate-200"
                        align="end"
                        sideOffset={5}
                      >
                        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-sky-300 [&_[cmdk-group-heading]]:tracking-wider">
                          <CommandInput
                            placeholder="Filter scan history..."
                            className="h-11 bg-slate-900/50 border-slate-700 placeholder:text-slate-500 focus:border-cyan-500"
                          />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty className="py-6 text-center text-sm text-slate-400">
                              No previous scans found.
                            </CommandEmpty>
                            {searchHistory.length > 0 && (
                              <CommandGroup heading="Recent Scans">
                                {searchHistory.map((historyItem) => (
                                  <CommandItem
                                    key={historyItem}
                                    onSelect={() =>
                                      handleHistorySelection(historyItem)
                                    }
                                    className="flex justify-between items-center group py-3 px-3 
                                                                                   hover:bg-sky-700/30 data-[selected=true]:bg-sky-600/40 transition-colors duration-150"
                                  >
                                    <span
                                      className="truncate flex-1 group-hover:text-cyan-300 text-slate-300 text-sm"
                                      title={historyItem}
                                    >
                                      {historyItem}
                                    </span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 opacity-60 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeHistoryItem(historyItem);
                                          }}
                                        >
                                          <X size={18} />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="left"
                                        className="bg-slate-800 text-slate-200 border-slate-700"
                                      >
                                        <p>Delete Scan</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                            
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto md:min-w-[160px] px-6 py-2.5 text-base font-semibold 
                                               bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 
                                               text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out 
                                               focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950
                                               disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search size={20} className="mr-2" />
                      Fetch Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
