import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import emptyState from "@/assets/empty.svg";
export default function ResultsTable() {
  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
  ];
  return (
    <div className="mt-4 w-full border border-border rounded-2xl overflow-hidden min-h-96 px-2">
      <Table className="w-full">
        <TableHeader className={undefined}>
          <TableRow className="">
            <TableHead className="font-sans text-normal text-muted-foreground">
              Invoice
            </TableHead>
            <TableHead className="font-sans text-normal text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="font-sans text-normal text-muted-foreground">
              Method
            </TableHead>
            <TableHead className="font-sans text-normal text-muted-foreground text-right">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={undefined}>
          {invoices.length === 0 ? (
            <TableRow className={undefined}>
              <TableCell colSpan={4} className="text-center py-16">
                <div className="flex flex-col items-center justify-center gap-2">
                  <img
                    src={emptyState}
                    alt="No results"
                    className="mx-auto w-32 opacity-50 mb-2"
                  />
                  <p className="text-normal font-semibold text-foreground font-sans">
                    No sponsors found for "blah".
                  </p>
                  <p className="text-xs font-normal text-muted-foreground font-mono">
                    No sponsors found for "blah".
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.invoice} className={undefined}>
                <TableCell className="font-medium text-normal">
                  {invoice.invoice}
                </TableCell>
                <TableCell className={undefined}>
                  {invoice.paymentStatus}
                </TableCell>
                <TableCell className={undefined}>
                  {invoice.paymentMethod}
                </TableCell>
                <TableCell className="text-right">
                  {invoice.totalAmount}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
