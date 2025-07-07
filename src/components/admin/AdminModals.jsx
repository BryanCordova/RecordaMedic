import React from 'react';
import MedicamentoForm from '@/components/MedicamentoForm'; 
import RecordatorioForm from '@/components/RecordatorioForm';
import InventarioForm from '@/components/InventarioForm';
import InteraccionForm from '@/components/InteraccionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  saveMedicamento as storageSaveMedicamento, 
  deleteMedicamento as storageDeleteMedicamento,
  saveRecordatorio as storageSaveRecordatorio,
  deleteRecordatorio as storageDeleteRecordatorio,
  markRecordatorioTomado as storageMarkRecordatorioTomado,
  updateInventario as storageUpdateInventario,
  deleteItemInventario as storageDeleteItemInventario,
  saveInteraccion as storageSaveInteraccion,
  deleteInteraccion as storageDeleteInteraccion,
  deleteHistorialEntry as storageDeleteHistorialEntry,
} from '@/lib/storage';

const AdminModals = ({ modalState, setModalState, selectedPaciente, globalMedicamentos, onRefreshData, toast }) => {
  
  const handleSaveMedicamento = (medicamento) => {
    if (!selectedPaciente?.id) {
      toast({ title: "Error", description: "Paciente no identificado para guardar medicamento.", variant: "destructive" });
      return;
    }
    storageSaveMedicamento(medicamento, selectedPaciente.id); 
    toast({ title: "Medicamento Guardado", description: "El medicamento ha sido guardado exitosamente.", className: "bg-green-500 text-white" });
    onRefreshData();
    setModalState({ isMedicamentoFormOpen: false, currentMedicamentoForForm: null });
  };

  const handleDelete = () => {
    if (!modalState.itemToDelete || !modalState.deleteDialogType) return;
    
    const itemId = typeof modalState.itemToDelete === 'object' ? modalState.itemToDelete.id : modalState.itemToDelete;
    const type = modalState.deleteDialogType;

    let targetUserId = selectedPaciente?.id;
    if (type === 'interaccion' && modalState.itemToDelete?.userId) { // Interacciones podrían tener un userId si se borran desde el contexto del paciente
        targetUserId = modalState.itemToDelete.userId;
    } else if (type === 'interaccion' && !modalState.itemToDelete?.userId) {
        targetUserId = null; // Interacciones globales no tienen userId específico
    }


    if (!targetUserId && type !== 'interaccion') { 
      toast({ title: "Error", description: "Paciente no identificado para eliminar el elemento.", variant: "destructive" });
      return;
    }

    let successMessage = "";

    switch (type) {
      case 'medicamento': 
        storageDeleteMedicamento(itemId, targetUserId); 
        successMessage = "Medicamento Eliminado";
        break;
      case 'recordatorio': 
        storageDeleteRecordatorio(itemId, targetUserId);
        successMessage = "Recordatorio Eliminado";
        break;
      case 'inventario': 
        storageDeleteItemInventario(itemId, targetUserId); 
        successMessage = "Ítem de Inventario Eliminado";
        break;
      case 'interaccion': 
        storageDeleteInteraccion(itemId, targetUserId); // Ahora pasamos targetUserId
        successMessage = "Interacción Eliminada";
        break;
      case 'historial': 
        storageDeleteHistorialEntry(itemId, targetUserId);
        successMessage = "Entrada de Historial Eliminada";
        break;
      default: break;
    }
    toast({ title: successMessage, description: "El elemento ha sido eliminado.", className: "bg-red-500 text-white" });
    onRefreshData();
    setModalState({ itemToDelete: null, deleteDialogType: '' });
  };
  
  const handleSaveRecordatorio = (recordatorio) => {
    if (!selectedPaciente?.id) {
      toast({ title: "Error", description: "Paciente no identificado para guardar recordatorio.", variant: "destructive" });
      return;
    }
    storageSaveRecordatorio(recordatorio, selectedPaciente.id);
    toast({ title: "Recordatorio Guardado", description: "El recordatorio ha sido guardado.", className: "bg-green-500 text-white" });
    onRefreshData();
    setModalState({ isRecordatorioFormOpen: false, currentRecordatorioForForm: null });
  };
  
  const handleSaveInventario = (item) => {
    if (!selectedPaciente?.id) {
      toast({ title: "Error", description: "Paciente no identificado para actualizar inventario.", variant: "destructive" });
      return;
    }
    storageUpdateInventario(item.medicamentoId, item.cantidad, item.fechaCaducidad, item.notas, selectedPaciente.id);
    toast({ title: "Inventario Actualizado", description: "El ítem de inventario ha sido actualizado.", className: "bg-green-500 text-white" });
    onRefreshData(); 
    setModalState({ isInventarioFormOpen: false, currentInventarioForForm: null });
  };

  const handleSaveInteraccion = (interaccion) => {
    if (!selectedPaciente?.id) {
        toast({ title: "Error", description: "Paciente no identificado para guardar interacción.", variant: "destructive" });
        return;
    }
    storageSaveInteraccion(interaccion, selectedPaciente.id); // Guardar interacción para el paciente seleccionado
    toast({ title: "Interacción Guardada", description: "La interacción ha sido guardada para el paciente.", className: "bg-green-500 text-white" });
    onRefreshData();
    setModalState({ isInteraccionFormOpen: false, currentInteraccionForForm: null });
  };

  const handleMarkTaken = () => {
    if (modalState.itemToMarkTaken) {
      if (!selectedPaciente?.id) {
        toast({ title: "Error", description: "Paciente no identificado para marcar toma.", variant: "destructive" });
        setModalState({ itemToMarkTaken: null });
        return;
      }
      storageMarkRecordatorioTomado(modalState.itemToMarkTaken, selectedPaciente.id);
      toast({ title: "Recordatorio Actualizado", description: "El recordatorio se marcó como tomado.", className: "bg-blue-500 text-white" });
      onRefreshData();
      setModalState({ itemToMarkTaken: null });
    }
  };


  return (
    <>
      {modalState.isMedicamentoFormOpen && (
        <MedicamentoForm
          medicamento={modalState.currentMedicamentoForForm}
          isOpen={modalState.isMedicamentoFormOpen}
          onClose={() => setModalState({ isMedicamentoFormOpen: false, currentMedicamentoForForm: null })}
          onSave={handleSaveMedicamento}
          userId={selectedPaciente?.id} 
        />
      )}
      {modalState.isRecordatorioFormOpen && (
        <RecordatorioForm
          recordatorio={modalState.currentRecordatorioForForm}
          isOpen={modalState.isRecordatorioFormOpen}
          onClose={() => setModalState({ isRecordatorioFormOpen: false, currentRecordatorioForForm: null })}
          onSave={handleSaveRecordatorio}
          userId={selectedPaciente?.id} 
        />
      )}
      {modalState.isInventarioFormOpen && selectedPaciente && (
        <InventarioForm
          item={modalState.currentInventarioForForm}
          isOpen={modalState.isInventarioFormOpen}
          onClose={() => setModalState({ isInventarioFormOpen: false, currentInventarioForForm: null })}
          onSave={handleSaveInventario}
          medicamentos={selectedPaciente?.medicamentos || []} 
          userId={selectedPaciente?.id} 
          isAdminContext={true} 
        />
      )}
      {modalState.isInteraccionFormOpen && selectedPaciente && (
         <InteraccionForm 
            interaccion={modalState.currentInteraccionForForm}
            isOpen={modalState.isInteraccionFormOpen}
            onClose={() => setModalState({ isInteraccionFormOpen: false, currentInteraccionForForm: null })}
            onSave={handleSaveInteraccion}
            allMedicamentos={selectedPaciente?.medicamentos || []} // Usar medicamentos del paciente para el contexto de la interacción
            userId={selectedPaciente?.id} // Pasar userId para guardar la interacción para este paciente
         />
      )}

      <Dialog open={!!modalState.itemToDelete} onOpenChange={(isOpen) => { if(!isOpen) setModalState({ itemToDelete: null, deleteDialogType: '' }); }}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Confirmar Eliminación</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              ¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setModalState({ itemToDelete: null, deleteDialogType: '' })} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!modalState.itemToMarkTaken} onOpenChange={(isOpen) => { if(!isOpen) setModalState({ itemToMarkTaken: null }); }}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Confirmar Toma</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              ¿Confirmas que este medicamento ha sido tomado?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setModalState({ itemToMarkTaken: null })} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancelar</Button>
            <Button onClick={handleMarkTaken} className="bg-green-600 hover:bg-green-700 text-white">Confirmar Toma</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminModals;