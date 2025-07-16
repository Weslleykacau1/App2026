
export const translations = {
  pt: {
    common: {
      loading: "Carregando...",
      edit: "Editar",
      save: "Salvar",
      cancel: "Cancelar",
    },
    roles: {
        passenger: 'Passageiro',
        driver: 'Motorista'
    },
    profile: {
      title: "Perfil",
      logout_btn: "Terminar Sessão",
      change_photo: "Alterar Foto",
      your_photo_alt: "Sua foto",
      camera_unavailable_title: "Câmera Indisponível",
      camera_unavailable_desc: "Permita o acesso à câmera para continuar ou escolha uma foto da galeria.",
      save_photo: "Salvar Foto",
      take_another: "Tirar Outra",
      take_photo_btn: "Tirar Foto",
      choose_from_gallery: "Escolher da Galeria",
      member_since: "Membro desde {{date}}",
      personal_info: "Informações Pessoais",
      form: {
          full_name: "Nome Completo",
          email: "Email",
          phone: "Whatsapp",
          cpf: "CPF"
      },
      address: {
        saved_locations: "Locais salvos",
        home: "Casa",
        work: "Trabalho",
        add_home: "Insira a morada de casa",
        add_work: "Insira a morada do trabalho",
        add_new: "Adicionar um local",
        edit_home_title: "Editar endereço de Casa",
        edit_work_title: "Editar endereço de Trabalho",
        add_new_title: "Adicionar novo local",
        edit_saved_title: "Editar local salvo",
        location_name: "Nome do Local",
        location_name_placeholder: "Ex: Academia, Casa da mãe",
        full_address: "Endereço Completo",
        full_address_placeholder: "Ex: Av. Paulista, 1000, São Paulo",
        save_address_btn: "Salvar Endereço"
      },
      vehicle: {
          title: "Gerenciamento de Veículo",
          description: "Mantenha as informações do seu veículo atualizadas.",
          form: {
              model: "Modelo do Veículo",
              license_plate: "Placa",
              color: "Cor",
              year: "Ano"
          }
      },
      documents: {
          title: "Gerenciamento de Documentos",
          cnh_title: "CNH",
          cnh_desc: "Carteira de Motorista",
          crlv_title: "CRLV",
          crlv_desc: "Documento do Veículo",
          id_title: "Documento de Identidade (RG/CPF)",
          id_desc: "Para verificação de conta",
          address_proof_title: "Comprovante de Endereço",
          address_proof_desc: "Opcional, para segurança",
          status_verified: "Verificado",
          status_pending: "Pendente",
          upload_btn: "Enviar novo arquivo"
      },
      history: {
          title: "Histórico de Corridas",
          description: "Veja os detalhes de suas viagens anteriores.",
          from: "De:",
          to: "Para:",
          status: {
              concluída: "Concluída",
              cancelada: "Cancelada"
          },
          request_again_btn: "Solicitar Novamente",
          no_rides: "Suas viagens aparecerão aqui.",
          load_error_desc: "Não foi possível carregar o histórico."
      },
      settings: {
          title: "Configurações",
          dark_mode: "Modo Escuro",
          dark_mode_desc: "Alterne entre o tema claro e escuro",
          notifications: "Notificações",
          notification_sounds: "Sons de notificação de novos pedidos de viagem",
          notification_sounds_desc: "Receba notificações de novas viagens na lista de solicitações",
          location: "Compartilhar Localização",
          location_desc: "Permitir rastreamento durante viagens",
          language: "Idioma",
          language_desc: "Selecione seu idioma preferido",
          privacy_title: "Privacidade e Segurança",
          privacy_share_data: "Compartilhar dados de viagem",
          privacy_share_data_desc: "Permitir análise para melhorar o serviço",
      }
    },
    toast: {
        error_title: "Erro",
        profile_load_error_title: "Erro ao carregar perfil",
        profile_load_error_desc: "Não foi possível carregar seus dados.",
        camera_denied_title: "Acesso à câmera negado",
        camera_denied_desc: "Por favor, habilite as permissões da câmera nas configurações do seu navegador para usar este recurso.",
        doc_sent_title: "Documento Enviado",
        doc_sent_desc_driver: "Sua {{doc}} foi enviada para análise.",
        doc_sent_desc_passenger: "Seu documento foi enviado para análise.",
        doc_send_error_desc: "Não foi possível enviar o documento.",
        info_saved_title: "Informações Salvas!",
        info_saved_desc: "Seus dados foram atualizados com sucesso.",
        info_save_error_desc: "Não foi possível salvar as informações.",
        vehicle_info_saved_desc: "Os dados do veículo foram atualizados.",
        vehicle_info_save_error_desc: "Não foi possível salvar as informações do veículo.",
        photo_saved_title: "Foto salva!",
        photo_saved_desc: "Sua foto de perfil foi atualizada.",
        photo_save_error_desc: "Não foi possível salvar sua foto.",
        reride_cancelled_title: "Não é possível repetir",
        reride_cancelled_desc: "Esta corrida foi cancelada.",
        address_saved_title: "Endereço salvo!",
        address_save_error_desc: "Não foi possível salvar o endereço.",
        location_removed_title: "Local removido!",
        location_remove_error_desc: "Não foi possível remover o local."
    }
  },
  en: {
    common: {
      loading: "Loading...",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
    },
     roles: {
        passenger: 'Passenger',
        driver: 'Driver'
    },
    profile: {
      title: "Profile",
      logout_btn: "Log Out",
      change_photo: "Change Photo",
      your_photo_alt: "Your photo",
      camera_unavailable_title: "Camera Unavailable",
      camera_unavailable_desc: "Please allow camera access to continue or choose a photo from the gallery.",
      save_photo: "Save Photo",
      take_another: "Take Another",
      take_photo_btn: "Take Photo",
      choose_from_gallery: "Choose from Gallery",
      member_since: "Member since {{date}}",
      personal_info: "Personal Information",
      form: {
          full_name: "Full Name",
          email: "Email",
          phone: "Whatsapp",
          cpf: "ID Number (CPF)"
      },
      address: {
        saved_locations: "Saved Locations",
        home: "Home",
        work: "Work",
        add_home: "Add home address",
        add_work: "Add work address",
        add_new: "Add a new place",
        edit_home_title: "Edit home address",
        edit_work_title: "Edit work address",
        add_new_title: "Add new place",
        edit_saved_title: "Edit saved place",
        location_name: "Location Name",
        location_name_placeholder: "E.g. Gym, Mom's house",
        full_address: "Full Address",
        full_address_placeholder: "E.g. 123 Main St, New York, NY",
        save_address_btn: "Save Address"
      },
      vehicle: {
          title: "Vehicle Management",
          description: "Keep your vehicle information up to date.",
          form: {
              model: "Vehicle Model",
              license_plate: "License Plate",
              color: "Color",
              year: "Year"
          }
      },
      documents: {
          title: "Document Management",
          cnh_title: "Driver's License",
          cnh_desc: "Your driver's license",
          crlv_title: "Vehicle Document",
          crlv_desc: "Your vehicle's registration document",
          id_title: "Identity Document",
          id_desc: "For account verification",
          address_proof_title: "Proof of Address",
          address_proof_desc: "Optional, for security",
          status_verified: "Verified",
          status_pending: "Pending",
          upload_btn: "Upload new file"
      },
      history: {
          title: "Ride History",
          description: "See the details of your past trips.",
          from: "From:",
          to: "To:",
          status: {
              concluída: "Completed",
              cancelada: "Canceled"
          },
          request_again_btn: "Request Again",
          no_rides: "Your trips will appear here.",
          load_error_desc: "Could not load ride history."
      },
      settings: {
          title: "Settings",
          dark_mode: "Dark Mode",
          dark_mode_desc: "Switch between light and dark theme",
          notifications: "Notifications",
          notification_sounds: "Notification sounds for new ride requests",
          notification_sounds_desc: "Receive notifications for new trips in the requests list",
          location: "Share Location",
          location_desc: "Allow tracking during trips",
          language: "Language",
          language_desc: "Select your preferred language",
          privacy_title: "Privacy and Security",
          privacy_share_data: "Share trip data",
          privacy_share_data_desc: "Allow analysis to improve the service",
      }
    },
    toast: {
        error_title: "Error",
        profile_load_error_title: "Error loading profile",
        profile_load_error_desc: "Could not load your data.",
        camera_denied_title: "Camera Access Denied",
        camera_denied_desc: "Please enable camera permissions in your browser settings to use this feature.",
        doc_sent_title: "Document Sent",
        doc_sent_desc_driver: "Your {{doc}} has been sent for analysis.",
        doc_sent_desc_passenger: "Your document has been sent for analysis.",
        doc_send_error_desc: "Could not send the document.",
        info_saved_title: "Information Saved!",
        info_saved_desc: "Your data has been successfully updated.",
        info_save_error_desc: "Could not save the information.",
        vehicle_info_saved_desc: "The vehicle data has been updated.",
        vehicle_info_save_error_desc: "Could not save the vehicle information.",
        photo_saved_title: "Photo saved!",
        photo_saved_desc: "Your profile picture has been updated.",
        photo_save_error_desc: "Could not save your photo.",
        reride_cancelled_title: "Cannot re-ride",
        reride_cancelled_desc: "This ride was cancelled.",
        address_saved_title: "Address saved!",
        address_save_error_desc: "Could not save the address.",
        location_removed_title: "Location removed!",
        location_remove_error_desc: "Could not remove location."
    }
  },
};

type NestedObject<T> = { [key: string]: T | NestedObject<T> };
type Path<T> = T extends NestedObject<infer U> ? `${string}.${Path<U>}` | keyof T : keyof T;

type FlattenKeys<T> = T extends object ? 
  { [K in keyof T]-?: K extends string ? 
      `${K}` | `${K}.${FlattenKeys<T[K]>}` : never 
  }[keyof T] : never;

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`

type DotNestedKeys<T> = (T extends object ?
    { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
    : "") extends infer D ? Extract<D, string> : never;


export type TranslationKey = DotNestedKeys<typeof translations.pt>;

    

    