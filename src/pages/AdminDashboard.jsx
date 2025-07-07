import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Pill as PillIcon, BellMinus as BellIcon, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllClientData, deleteUserClient } from '@/lib/auth';
import { useToast } from "@/components/ui/use-toast";
import AdminClientDetails from '@/components/admin/AdminClientDetails';
import AdminStatCard from '@/components/admin/AdminStatCard';
import AdminClientList from '@/components/admin/AdminClientList';
import AdminModals from '@/components/admin/AdminModals';
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleShad, DialogFooter, DialogDescription as DialogDescriptionShad } from "@/components/ui/dialog";


const AdminDashboard = () => {
  const { toast } = useToast();
  const [pacienteData, setPacienteData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  
  const [globalMedicamentosCount, setGlobalMedicamentosCount] = useState(0);
  const [globalRecordatoriosCount, setGlobalRecordatoriosCount] = useState(0);
  const [allMedicamentosForForms, setAllMedicamentosForForms] = useState([]);

  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);


  const [modalState, setModalState] = useState({
    isMedicamentoFormOpen: false,
    currentMedicamentoForForm: null,
    isRecordatorioFormOpen: false,
    currentRecordatorioForForm: null,
    isInventarioFormOpen: false,
    currentInventarioForForm: null,
    isInteraccionFormOpen: false,
    currentInteraccionForForm: null,
    itemToDelete: null,
    deleteDialogType: '',
    itemToMarkTaken: null,
  });

  const fetchAllData = useCallback(() => {
    const allData = getAllClientData(); 
    setPacienteData(allData);

    let totalMeds = 0;
    let totalRecs = 0;
    let allMedsList = []; 

    allData.forEach(paciente => {
      totalMeds += paciente.medicamentos?.length || 0;
      totalRecs += paciente.recordatorios?.length || 0;
      if (paciente.medicamentos) {
        allMedsList = allMedsList.concat(paciente.medicamentos);
      }
    });
    
    const uniqueMedNames = new Set();
    const uniqueMedsForForms = allMedsList.filter(med => {
        if (!uniqueMedNames.has(med.nombre.toLowerCase())) {
            uniqueMedNames.add(med.nombre.toLowerCase());
            return true;
        }
        return false;
    });
    setAllMedicamentosForForms(uniqueMedsForForms);

    setGlobalMedicamentosCount(totalMeds);
    setGlobalRecordatoriosCount(totalRecs);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  const refreshSelectedPacienteData = useCallback(() => {
    fetchAllData(); 

    if (selectedPaciente) {
      const allUsers = getAllClientData(); 
      const updatedPacienteDataFromList = allUsers.find(c => c.id === selectedPaciente.id);
      
      if (updatedPacienteDataFromList) {
        setSelectedPaciente(updatedPacienteDataFromList); 
      } else {
        setSelectedPaciente(null); 
      }
    }
  }, [selectedPaciente, fetchAllData]);


  const handleSetModalState = useCallback((newModalStatePartial) => {
    setModalState(prevState => ({ ...prevState, ...newModalStatePartial }));
  }, []);

  const openDeleteUserDialog = (paciente) => {
    setUserToDelete(paciente);
    setIsDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      try {
        deleteUserClient(userToDelete.id);
        toast({
          title: "Usuario Eliminado",
          description: `El usuario ${userToDelete.username} y todos sus datos han sido eliminados.`,
          variant: "destructive"
        });
        fetchAllData(); 
        setIsDeleteUserDialogOpen(false);
        setUserToDelete(null);
        if (selectedPaciente && selectedPaciente.id === userToDelete.id) {
          setSelectedPaciente(null); 
        }
      } catch (error) {
        toast({
          title: "Error al Eliminar Usuario",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const filteredPacientes = pacienteData.filter(paciente =>
    paciente.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = pacienteData.length;

  if (selectedPaciente) {
    return (
      <>
        <AdminClientDetails 
          paciente={selectedPaciente} 
          onBack={() => setSelectedPaciente(null)}
          onRefreshData={refreshSelectedPacienteData}
          globalMedicamentos={allMedicamentosForForms} 
          setModalState={handleSetModalState} 
          toast={toast}
        />
        <AdminModals
          modalState={modalState}
          setModalState={handleSetModalState} 
          selectedPaciente={selectedPaciente} 
          globalMedicamentos={allMedicamentosForForms} 
          onRefreshData={refreshSelectedPacienteData} 
          toast={toast}
        />
      </>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="space-y-8 p-4 md:p-8 bg-gradient-to-br from-slate-50 to-sky-100 dark:from-slate-900 dark:to-sky-950 min-h-screen"
    >
      <Card className="shadow-2xl rounded-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <CardTitle className="text-4xl font-extrabold gradient-text animate-fade-in">Panel de Administrador</CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
            Gestiona y visualiza la información de los usuarios de RecordaMedic.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard title="Total de Usuarios" value={totalUsers} icon={<Users className="h-8 w-8 text-blue-500" />} color="border-blue-500" animationDelay={0.1} />
        <AdminStatCard title="Medicamentos Registrados (Todos los Pacientes)" value={globalMedicamentosCount} icon={<PillIcon className="h-8 w-8 text-green-500" />} color="border-green-500" animationDelay={0.2} />
        <AdminStatCard title="Recordatorios Programados (Todos los Pacientes)" value={globalRecordatoriosCount} icon={<BellIcon className="h-8 w-8 text-yellow-500" />} color="border-yellow-500" animationDelay={0.3} />
      </div>

      <Card className="shadow-2xl rounded-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Gestión de Pacientes</CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
            <Input
              placeholder="Buscar paciente por nombre o correo..."
              className="pl-12 text-base py-3 rounded-lg shadow-inner bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AdminClientList
            pacientes={filteredPacientes}
            onSelectPaciente={setSelectedPaciente}
            onDeletePaciente={openDeleteUserDialog}
            searchTerm={searchTerm}
          />
        </CardContent>
      </Card>
      
    

      <AdminModals
        modalState={modalState}
        setModalState={handleSetModalState} 
        selectedPaciente={selectedPaciente} 
        globalMedicamentos={allMedicamentosForForms}
        onRefreshData={refreshSelectedPacienteData}
        toast={toast}
      />

      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitleShad className="text-xl font-semibold text-destructive dark:text-red-400">Confirmar Eliminación de Usuario</DialogTitleShad>
            <DialogDescriptionShad className="text-slate-600 dark:text-slate-400">
              ¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete?.username}</strong>? 
              Esta acción es irreversible y eliminará todos sus datos asociados (medicamentos, recordatorios, historial, etc.).
            </DialogDescriptionShad>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)} className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700 text-white">Eliminar Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default AdminDashboard;
