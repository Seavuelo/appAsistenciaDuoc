import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ClaseService {
  constructor(
    private firestore: Firestore,
  ) {}

  async obtenerClasesPorAsignatura(asignatura_id: string) {
    const claseRef = collection(this.firestore, 'clase');
    const claseQuery = query(claseRef, where('asignatura_id', '==', asignatura_id));
    
    const querySnapshot = await getDocs(claseQuery);
    return querySnapshot.docs.map(doc => doc.data());
  }
  async obtenerClasePorCodigo(codigo: string) {
    const claseRef = collection(this.firestore, 'clase');
    const q = query(claseRef, where('codigo', '==', codigo));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      throw new Error('Clase no encontrada');
    }
  
    const claseData = querySnapshot.docs[0].data(); 
    return claseData;
  }

}
