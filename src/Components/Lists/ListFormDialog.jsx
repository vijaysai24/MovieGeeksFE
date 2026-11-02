import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionApi } from "../../Services/userService";
import { errorMessage } from "../../Services/api";
import { useToast } from "../../Context/ToastContext";
import { Dialog } from "../UI/Dialog";
import { Button } from "../UI/Button";
import { Field, TextArea, TextInput } from "../UI/Field";

// Start a list, or change an existing one's name, note and visibility.
export function ListFormDialog({ list, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({
    name: list?.name || "",
    description: list?.description || "",
    isPublic: list?.isPublic ?? true,
    isRanked: list?.isRanked ?? false,
  });
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, name: form.name.trim(), description: form.description.trim() || null };
      return list ? collectionApi.update(list.id, body) : collectionApi.create(body);
    },
    onSuccess: (saved) => {
      toast.show(list ? "List saved" : `Started ${saved.name}`);
      queryClient.invalidateQueries({ queryKey: ["me", "collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      onSaved?.(saved);
      onClose();
    },
  });

  return (
    <Dialog open onClose={onClose} title={list ? "Edit list" : "New list"}>
      <form onSubmit={(event) => { event.preventDefault(); if (form.name.trim()) save.mutate(); }} className="space-y-5">
        <Field label="Name">
          {(props) => <TextInput {...props} name="list-name" autoComplete="off" maxLength={100} required placeholder="Best rainy-night thrillers…" value={form.name} onChange={set("name")} />}
        </Field>
        <Field label="Description" hint="Optional. What ties these titles together?">
          {(props) => <TextArea {...props} name="list-description" maxLength={1000} className="min-h-24" value={form.description} onChange={set("description")} />}
        </Field>
        <div className="space-y-1">
          <label className="flex min-h-10 items-center gap-3 text-[15px] text-ink">
            <input type="checkbox" checked={form.isRanked} onChange={set("isRanked")} className="h-4 w-4 accent-[#f5b02e]" />
            Numbered, in your order
          </label>
          <label className="flex min-h-10 items-center gap-3 text-[15px] text-ink">
            <input type="checkbox" checked={!form.isPublic} onChange={(event) => setForm((current) => ({ ...current, isPublic: !event.target.checked }))} className="h-4 w-4 accent-[#f5b02e]" />
            Keep it private
          </label>
        </div>
        {save.isError && <p className="text-sm text-negative" role="alert">{errorMessage(save.error)}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!form.name.trim() || save.isPending}>{list ? "Save List" : "Create List"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
