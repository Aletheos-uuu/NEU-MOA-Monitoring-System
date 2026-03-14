"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { History, User, Calendar } from 'lucide-react';

interface AuditTrailEntry {
  userId: string;
  userName: string;
  userEmail: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'RECOVER';
  timestamp: string;
}

interface AuditTrailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trail: AuditTrailEntry[];
  companyName: string;
}

export function AuditTrailDialog({ open, onOpenChange, trail, companyName }: AuditTrailDialogProps) {
  // Sort trail by timestamp descending (newest first)
  const sortedTrail = [...(trail || [])].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getOperationBadge = (op: string) => {
    switch (op) {
      case 'INSERT': return <Badge className="bg-green-500 hover:bg-green-600">INSERT</Badge>;
      case 'UPDATE': return <Badge className="bg-blue-500 hover:bg-blue-600">UPDATE</Badge>;
      case 'DELETE': return <Badge variant="destructive">DELETE</Badge>;
      case 'RECOVER': return <Badge className="bg-purple-500 hover:bg-purple-600">RECOVER</Badge>;
      default: return <Badge variant="outline">{op}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <History className="h-5 w-5 text-primary" />
            Audit History: {companyName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto mt-4 border rounded-md shadow-inner">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrail.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">
                    No history records found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTrail.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.userName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{entry.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {getOperationBadge(entry.operation)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}