import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api, { getMyTransactions } from "@/lib/api";

export interface Notification {
  id: string;
  type: "new_request" | "status_change";
  message: string;
  transactionId?: string;
  status?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  adminNotifications: Notification[];
  clientNotifications: Notification[];
  unreadAdminCount: number;
  unreadClientCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY_ADMIN = "seramoney-admin-notifications";
const STORAGE_KEY_CLIENT = "seramoney-client-notifications";
const LAST_CHECK_KEY_ADMIN = "seramoney-admin-last-check";
const LAST_CHECK_KEY_CLIENT = "seramoney-client-last-check";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [adminNotifications, setAdminNotifications] = useState<Notification[]>([]);
  const [clientNotifications, setClientNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const storedAdmin = localStorage.getItem(STORAGE_KEY_ADMIN);
      const storedClient = localStorage.getItem(STORAGE_KEY_CLIENT);
      
      if (user.role === "ADMIN" && storedAdmin) {
        try {
          setAdminNotifications(JSON.parse(storedAdmin));
        } catch (e) {
          console.error("Error parsing admin notifications:", e);
        }
      }
      
      if (user.role !== "ADMIN" && storedClient) {
        try {
          setClientNotifications(JSON.parse(storedClient));
        } catch (e) {
          console.error("Error parsing client notifications:", e);
        }
      }
    }
  }, [isAuthenticated, user]);

  // Sauvegarder les notifications dans localStorage
  useEffect(() => {
    if (user?.role === "ADMIN") {
      localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminNotifications));
    } else if (user) {
      localStorage.setItem(STORAGE_KEY_CLIENT, JSON.stringify(clientNotifications));
    }
  }, [adminNotifications, clientNotifications, user]);

  // Vérifier les nouvelles demandes pour l'admin
  const checkAdminNotifications = useCallback(async () => {
    if (!user || user.role !== "ADMIN") return;

    try {
      const response = await api.get("/admin/transactions");
      const transactions = response.data || [];
      
      // Filtrer les nouvelles demandes (EN_ATTENTE)
      const newRequests = transactions.filter((tx: any) => tx.status === "EN_ATTENTE");
      
      const lastCheck = localStorage.getItem(LAST_CHECK_KEY_ADMIN);
      const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(0);
      
      // Trouver les nouvelles demandes depuis la dernière vérification
      const notificationsToAdd: Notification[] = [];
      
      newRequests.forEach((tx: any) => {
        const txDate = new Date(tx.created_at);
        if (txDate > lastCheckDate) {
          // Vérifier si une notification existe déjà
          const exists = adminNotifications.some(
            n => n.type === "new_request" && n.transactionId === tx.id
          );
          
          if (!exists) {
            notificationsToAdd.push({
              id: `admin-${tx.id}-${tx.created_at}`,
              type: "new_request",
              message: `Nouvelle demande de ${tx.client_name} - ${tx.reference}`,
              transactionId: tx.id,
              createdAt: tx.created_at,
              read: false,
            });
          }
        }
      });
      
      if (notificationsToAdd.length > 0) {
        setAdminNotifications(prev => [...notificationsToAdd, ...prev]);
      }
      
      localStorage.setItem(LAST_CHECK_KEY_ADMIN, new Date().toISOString());
    } catch (error) {
      console.error("Error checking admin notifications:", error);
    }
  }, [user, adminNotifications]);

  // Vérifier les changements de statut pour le client
  const checkClientNotifications = useCallback(async () => {
    if (!user || user.role === "ADMIN") return;

    try {
      const transactions = await getMyTransactions();
      
      const lastCheck = localStorage.getItem(LAST_CHECK_KEY_CLIENT);
      const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(0);
      
      const notificationsToAdd: Notification[] = [];
      
      transactions.forEach((tx: any) => {
        // Vérifier si le statut a changé depuis la dernière vérification
        if (tx.updated_at && tx.status !== "EN_ATTENTE") {
          const updateDate = new Date(tx.updated_at);
          
          if (updateDate > lastCheckDate) {
            // Vérifier si une notification existe déjà pour ce changement
            const exists = clientNotifications.some(
              n => n.type === "status_change" && 
                   n.transactionId === tx.id && 
                   n.status === tx.status
            );
            
            if (!exists) {
              const statusMessages: Record<string, string> = {
                PAYE: "Votre paiement a été reçu",
                CRYPTO_ENVOYEE: "Votre crypto a été envoyée",
                TERMINE: "Votre transaction est terminée",
                REFUSE: "Votre transaction a été refusée",
              };
              
              notificationsToAdd.push({
                id: `client-${tx.id}-${tx.status}-${tx.updated_at}`,
                type: "status_change",
                message: statusMessages[tx.status] || `Le statut de votre transaction a changé: ${tx.reference}`,
                transactionId: tx.id,
                status: tx.status,
                createdAt: tx.updated_at,
                read: false,
              });
            }
          }
        }
      });
      
      if (notificationsToAdd.length > 0) {
        setClientNotifications(prev => [...notificationsToAdd, ...prev]);
      }
      
      localStorage.setItem(LAST_CHECK_KEY_CLIENT, new Date().toISOString());
    } catch (error) {
      console.error("Error checking client notifications:", error);
    }
  }, [user, clientNotifications]);

  // Vérifier les notifications toutes les 30 secondes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      if (user.role === "ADMIN") {
        checkAdminNotifications();
      } else {
        checkClientNotifications();
      }
    }, 30000); // Vérifier toutes les 30 secondes

    // Vérifier immédiatement
    if (user.role === "ADMIN") {
      checkAdminNotifications();
    } else {
      checkClientNotifications();
    }

    return () => clearInterval(interval);
  }, [isAuthenticated, user, checkAdminNotifications, checkClientNotifications]);

  const markAsRead = (notificationId: string) => {
    if (user?.role === "ADMIN") {
      setAdminNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } else {
      setClientNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = () => {
    if (user?.role === "ADMIN") {
      setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } else {
      setClientNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: `${notification.type}-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };

    if (user?.role === "ADMIN") {
      setAdminNotifications(prev => [newNotification, ...prev]);
    } else {
      setClientNotifications(prev => [newNotification, ...prev]);
    }
  };

  const clearNotifications = () => {
    if (user?.role === "ADMIN") {
      setAdminNotifications([]);
      localStorage.removeItem(STORAGE_KEY_ADMIN);
    } else {
      setClientNotifications([]);
      localStorage.removeItem(STORAGE_KEY_CLIENT);
    }
  };

  const refreshNotifications = async () => {
    if (user?.role === "ADMIN") {
      await checkAdminNotifications();
    } else {
      await checkClientNotifications();
    }
  };

  const unreadAdminCount = adminNotifications.filter(n => !n.read).length;
  const unreadClientCount = clientNotifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        adminNotifications,
        clientNotifications,
        unreadAdminCount,
        unreadClientCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
