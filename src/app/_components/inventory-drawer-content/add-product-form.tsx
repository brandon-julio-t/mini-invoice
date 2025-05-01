import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateProductMutation } from "@/service/product";
import { useUpsertProductInventoryMutation } from "@/service/product-inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  inventoryQuantity: z.coerce.number().min(0),
});

export const InventoryDrawerAddProductForm: React.ComponentType<{
  defaultName: string;
  onSuccess: () => void;
}> = ({ defaultName, onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onTouched",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
      inventoryQuantity: 0,
    },
  });

  const createProductMutation = useCreateProductMutation();
  const upsertProductInventoryMutation = useUpsertProductInventoryMutation();

  const onSubmit = form.handleSubmit(async (data) => {
    const createProductResponse = await toast
      .promise(
        createProductMutation.mutateAsync({
          name: data.name,
        }),
        {
          loading: "Creating product...",
          success: "Product created successfully",
          error: "Failed to create product",
        },
      )
      .unwrap();

    await toast
      .promise(
        upsertProductInventoryMutation.mutateAsync({
          productId: createProductResponse.data.id,
          finalQuantity: data.inventoryQuantity,
        }),
        {
          loading: "Creating product inventory...",
          success: "Product inventory created successfully",
          error: "Failed to create product inventory",
        },
      )
      .unwrap();

    onSuccess();
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 pb-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inventoryQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Quantity</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};
