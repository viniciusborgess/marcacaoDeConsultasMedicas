import React from 'react';
import styled from 'styled-components/native';
import { ViewStyle } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import theme from '../styles/theme';

/**
 * Interface para dados do médico
 */
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

/**
 * Props do componente de lista de médicos
 * Permite seleção de médico com destaque visual
 */
interface DoctorListProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  selectedDoctorId?: string;
  style?: ViewStyle;
}

/**
 * Lista de médicos disponíveis para seleção
 * Exibe avatar, nome e especialidade com destaque para o médico selecionado
 */
const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  onSelectDoctor,
  selectedDoctorId,
  style,
}) => {
  return (
    <Container style={style}>
      {doctors.map((doctor) => (
        <ListItem
          key={doctor.id}
          onPress={() => onSelectDoctor(doctor)}
          containerStyle={[
            styles.listItem,
            selectedDoctorId === doctor.id && styles.selectedItem,
          ]}
        >
          <Avatar
            size="medium"
            rounded
            source={{ uri: doctor.image }}
            containerStyle={styles.avatar}
          />
          <ListItem.Content>
            <ListItem.Title style={styles.name}>{doctor.name}</ListItem.Title>
            <ListItem.Subtitle style={styles.specialty}>
              {doctor.specialty}
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      ))}
    </Container>
  );
};

const styles = {
  listItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedItem: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  specialty: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
};

const Container = styled.View`
  margin-bottom: 15px;
`;

export default DoctorList; 