import React from 'react';
import { Image, Text, View } from 'react-native';
import type { Course } from '../types';
import { styles as s } from '../styles';
import { ActionButton } from './ActionButton';
export function CourseCard({ course, saved, onOpen, onSave }: {
  course: Course; saved: boolean; onOpen: () => void; onSave: () => void;
}) {
  return <View style={s.card}>
    {course.image ? <Image source={course.image} style={s.courseImage} resizeMode="cover" accessible={false} />
      : <View style={s.placeholder}><Text style={[s.heading, s.purple]}>{course.category}</Text></View>}
    <Text style={s.cardTitle}>{course.title}</Text>
    <Text style={s.muted}>{course.lessons} lessons · {course.duration}</Text>
    <Text style={s.body}>{course.description}</Text>
    <ActionButton label={`Explore ${course.title}`} onPress={onOpen} />
    <ActionButton secondary selected={saved} label={`${saved ? 'Unsave' : 'Save'} ${course.title}`} onPress={onSave} />
  </View>;
}
