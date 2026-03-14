"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc, updateDoc, collection, addDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const moaSchema = z.object({
  hteId: z.string().min(1, 'HTE ID is required'),
  companyName: z.string().min(1, 'Company name is required'),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email('Invalid email').or(z.literal('')),
  industryType: z.enum(["Telecom", "Food", "Services", "Technology", "Finance"]),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  status: z.string().min(1, 'Status is required'),
  endorsedByCollege: z.string().optional(),
});

type MoaFormValues = z.infer<typeof moaSchema>;

interface MoaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function MoaFormDialog({ open, onOpenChange, initialData }: MoaFormDialogProps) {
  const { profile } = useAuth();
  const form = useForm<MoaFormValues>({
    resolver: zodResolver(moaSchema),
    defaultValues: initialData || {
      hteId: '',
      companyName: '',
      address: '',
      contactPerson: '',
      contactEmail: '',
      industryType: 'Technology',
      effectiveDate: '',
      expiryDate: '',
      status: 'PROCESSING: MOA draft sent to Legal Office',
      endorsedByCollege: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        hteId: '',
        companyName: '',
        address: '',
        contactPerson: '',
        contactEmail: '',
        industryType: 'Technology',
        effectiveDate: '',
        expiryDate: '',
        status: 'PROCESSING: MOA draft sent to Legal Office',
        endorsedByCollege: '',
      });
    }
  }, [initialData, open, form]);

  const onSubmit = (values: MoaFormValues) => {
    if (!profile) return;

    const auditEntry = {
      userId: profile.uid,
      userName: profile.fullName,
      userEmail: profile.email,
      operation: initialData ? 'UPDATE' : 'INSERT',
      timestamp: new Date().toISOString(),
    };

    if (initialData?.id) {
      const docRef = doc(db, 'moas', initialData.id);
      updateDoc(docRef, {
        ...values,
        auditTrail: arrayUnion(auditEntry),
      }).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: values,
        }));
      });
    } else {
      const colRef = collection(db, 'moas');
      const newData = {
        ...values,
        isDeleted: false,
        auditTrail: [auditEntry],
      };
      addDoc(colRef, newData).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: newData,
        }));
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit MOA' : 'Register New MOA'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTE ID</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g. HTE-2024-001" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["Telecom", "Food", "Services", "Technology", "Finance"].map(i => (
                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "APPROVED: Signed by President",
                        "APPROVED: On-going notarization",
                        "APPROVED: No notarization needed",
                        "PROCESSING: Awaiting signature by HTE partner",
                        "PROCESSING: MOA draft sent to Legal Office",
                        "PROCESSING: MOA draft sent to VPAA/OP for approval",
                        "EXPIRED: No renewal done",
                        "EXPIRING: Two months before expiration"
                      ].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endorsedByCollege"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endorsed By (College/Dept)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{initialData ? 'Update MOA' : 'Register MOA'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}