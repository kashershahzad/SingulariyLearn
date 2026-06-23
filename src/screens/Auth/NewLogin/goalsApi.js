import {ApiRequest} from '../../../services/ApiRequest';

export const fetchGoals = async () => {
  const result = await ApiRequest({type: 'get_goals'});
  if (result.data?.result === true || result.data?.result === 'true') {
    return result.data.goals || [];
  }
  return [];
};

export const mapGoalForDisplay = (item, langCode = 'en') => {
  const icon = item.icon || '';
  const iconUrl = icon.startsWith('http') ? icon : icon ? `https://${icon}` : null;

  return {
    id: String(item.id),
    title: item.name?.[langCode] ?? item.name?.en ?? '',
    subtitle: (item.description?.[langCode] ?? item.description?.en ?? '').replace(
      /\r\n/g,
      '',
    ),
    iconUrl,
    tags: (item.tags || []).map((text, index) => ({
      text,
      tone: index === 0 ? 'accent' : 'muted',
    })),
  };
};
