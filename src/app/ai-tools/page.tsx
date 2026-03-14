"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { identifyMoaKeyClauses, IdentifyMoaKeyClausesOutput } from '@/ai/flows/identify-moa-key-clauses-flow';
import { Cpu, FileText, CheckCircle, AlertTriangle, ListChecks, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AiToolsPage() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<IdentifyMoaKeyClausesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast({ variant: 'destructive', title: 'Input Required', description: 'Please paste the MOA text to analyze.' });
      return;
    }

    setLoading(true);
    try {
      const output = await identifyMoaKeyClauses({ moaDocumentText: inputText });
      setResult(output);
      toast({ title: 'Analysis Complete', description: 'AI has successfully processed the document.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not process the document text.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Cpu className="h-8 w-8 text-accent" />
            AI MOA Analyzer
          </h1>
          <p className="text-muted-foreground">Extract key clauses, actionable items, and obligations instantly using GenAI.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Document Input</CardTitle>
              <CardDescription>Paste the full text of the Memorandum of Agreement below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Paste MOA text here..." 
                className="min-h-[400px] font-mono text-sm leading-relaxed"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={loading} 
                className="w-full h-12 text-lg shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <Cpu className="mr-2 h-5 w-5" />
                    Analyze Agreement
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {!result && !loading ? (
              <div className="bg-white border-2 border-dashed rounded-xl h-[500px] flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-lg font-semibold">Ready for Analysis</h3>
                <p className="max-w-xs mt-2">Paste text on the left and click analyze to see results here.</p>
              </div>
            ) : loading ? (
               <div className="bg-white border rounded-xl h-[500px] flex flex-col items-center justify-center text-muted-foreground p-8 text-center animate-pulse">
                <Loader2 className="h-16 w-16 mb-4 animate-spin text-primary" />
                <h3 className="text-lg font-semibold">AI is Thinking...</h3>
                <p className="max-w-xs mt-2">Identifying clauses, obligations, and actionable tasks.</p>
              </div>
            ) : (
              <Card className="min-h-[500px] border-accent/20 border-2">
                <CardHeader className="bg-accent/5 rounded-t-xl border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="clauses" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="clauses" className="gap-2">
                        <ListChecks className="h-4 w-4" />
                        Clauses
                      </TabsTrigger>
                      <TabsTrigger value="actions" className="gap-2">
                        <TrendingUpIcon className="h-4 w-4" />
                        Actions
                      </TabsTrigger>
                      <TabsTrigger value="obligations" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Obligations
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="clauses" className="space-y-4">
                      {result.keyClauses.map((item, idx) => (
                        <div key={idx} className="p-4 bg-muted/30 rounded-lg border border-primary/10 text-sm leading-relaxed">
                          {item}
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="actions" className="space-y-4">
                      {result.actionableItems.map((item, idx) => (
                        <div key={idx} className="p-4 bg-green-50 border border-green-100 rounded-lg text-sm flex gap-3">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-green-900">{item}</span>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="obligations" className="space-y-4">
                      {result.obligations.map((item, idx) => (
                        <div key={idx} className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm flex gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-amber-900">{item}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
