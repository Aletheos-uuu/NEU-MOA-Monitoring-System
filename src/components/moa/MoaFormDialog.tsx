"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, collection, addDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, User, Calendar, Hash, GraduationCap } from 'lucide-react';

const COLLEGES = [
  "College of Accountancy","College of Agriculture","College of Arts and Sciences",
  "College of Business Administration","College of Communication","College of Criminology",
  "College of Education","College of Engineering and Architecture",
  "College of Informatics and Computing Studies","College of Medical Technology",
  "College of Midwifery","College of Music","College of Nursing",
  "College of Physical Therapy","College of Respiratory Therapy",
  "School of International Relations","College of Law","College of Medicine",
  "School of Graduate Studies",
];

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
  endorsedByCollege: z.string().min(1, 'College endorsement is required'),
});

type MoaFormValues = z.infer<typeof moaSchema>;

interface MoaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

function SectionHeader({ icon: Icon, label, index }: { icon: any; label: string; index: number }) {
  return (
    <div
      className="flex items-center gap-2 mb-3.5"
      style={{
        animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div className="h-6 w-6 rounded-md bg-primary/8 flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );
}

function FieldDivider() {
  return <div className="my-5 h-px bg-gray-100" />;
}

export function MoaFormDialog({ open, onOpenChange, initialData }: MoaFormDialogProps) {
  const { profile } = useAuth();
  const isEditing = !!initialData?.id;

  const form = useForm<MoaFormValues>({
    resolver: zodResolver(moaSchema),
    defaultValues: initialData || {
      hteId: '', companyName: '', address: '', contactPerson: '', contactEmail: '',
      industryType: 'Technology', effectiveDate: '', expiryDate: '',
      status: 'PROCESSING: MOA draft sent to Legal Office for Review',
      endorsedByCollege: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        hteId: '', companyName: '', address: '', contactPerson: '', contactEmail: '',
        industryType: 'Technology', effectiveDate: '', expiryDate: '',
        status: 'PROCESSING: MOA draft sent to Legal Office for Review',
        endorsedByCollege: '',
      });
    }
  }, [initialData, open, form]);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      // Radix Dialog sometimes leaves pointer-events:none on body — force-clear it
      setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 0);
    }
  };

  const onSubmit = (values: MoaFormValues) => {
    if (!profile) return;
    const auditEntry = {
      userId: profile.uid, userName: profile.fullName, userEmail: profile.email,
      operation: isEditing ? 'UPDATE' : 'INSERT',
      timestamp: new Date().toISOString(),
    };

    if (isEditing) {
      const docRef = doc(db, 'moas', initialData.id);
      updateDoc(docRef, { ...values, auditTrail: arrayUnion(auditEntry) }).catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: values }));
      });
    } else {
      const colRef = collection(db, 'moas');
      addDoc(colRef, { ...values, isDeleted: false, auditTrail: [auditEntry] }).catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: colRef.path, operation: 'create', requestResourceData: values }));
      });
    }
    onOpenChange(false);
    setTimeout(() => {
      document.body.style.pointerEvents = '';
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">

        {/* Header */}
        <DialogHeader
          className="px-6 pt-6 pb-4 border-b border-gray-100"
          style={{ animation: 'fadeDown 0.35s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <DialogTitle className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit Agreement' : 'Register New Agreement'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1">
            {isEditing
              ? 'Update the MOA details below. Changes will be recorded in the audit trail.'
              : 'Fill in the details to register a new Memorandum of Agreement.'}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form id="moa-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">

              {/* ── Section 1: Company Information ── */}
              <SectionHeader icon={Building2} label="Company Information" index={0} />

              <div
                className="grid grid-cols-2 gap-4 mb-4"
                style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '60ms' }}
              >
                <FormField
                  control={form.control}
                  name="hteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">HTE ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <Input {...field} placeholder="e.g. HTE-2024-001" className="pl-9 h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm bg-gray-50 border-gray-200 transition-colors hover:bg-white">
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

              <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '100ms' }}>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-xs font-semibold text-gray-600">Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Official company name" className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '130ms' }}>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Company address" rows={2} className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200 resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FieldDivider />

              {/* ── Section 2: Contact Details ── */}
              <SectionHeader icon={User} label="Contact Details" index={1} />

              <div
                className="grid grid-cols-2 gap-4"
                style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '160ms' }}
              >
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Full name" className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@company.com" className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FieldDivider />

              {/* ── Section 3: Agreement Terms ── */}
              <SectionHeader icon={Calendar} label="Agreement Terms" index={2} />

              <div
                className="grid grid-cols-2 gap-4 mb-4"
                style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '220ms' }}
              >
                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Effective Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Expiry Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors duration-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '250ms' }}>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-xs font-semibold text-gray-600">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm bg-gray-50 border-gray-200 transition-colors hover:bg-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[
                            "APPROVED: Signed by President",
                            "APPROVED: On-going notarization",
                            "APPROVED: No notarization needed",
                            "PROCESSING: Awaiting signature by HTE partner",
                            "PROCESSING: MOA draft sent to Legal Office for Review",
                            "PROCESSING: MOA draft and opinion of legal office sent to VPAA/OP for approval",
                            "EXPIRED: No renewal done",
                            "EXPIRING: Two months before expiration",
                          ].map(s => (
                            <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FieldDivider />

              {/* ── Section 4: Endorsement ── */}
              <SectionHeader icon={GraduationCap} label="Endorsement" index={3} />

              <div style={{ animation: 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '300ms' }}>
                <FormField
                  control={form.control}
                  name="endorsedByCollege"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Endorsed By (College / Department)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm bg-gray-50 border-gray-200 transition-colors hover:bg-white">
                            <SelectValue placeholder="Select college or department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLLEGES.map(c => <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <DialogFooter
          className="px-6 py-4 border-t border-gray-100 bg-gray-50/50"
          style={{ animation: 'fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '150ms' }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-5 text-sm font-semibold border-gray-200 transition-all duration-150 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="moa-form"
            className="h-10 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-px active:translate-y-0"
          >
            {isEditing ? 'Save Changes' : 'Register MOA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}