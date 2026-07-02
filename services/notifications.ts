import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Podesi kako se notifikacije ponasaju dok je aplikacija otvorena
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Trazi dozvolu za notifikacije (obavezno na iOS, dobra praksa i na Android)
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return finalStatus === "granted";
}

// Posalji trenutnu (instant) notifikaciju - koristimo za potvrdu uspesne akcije
export async function sendInstantNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // null = odmah
  });
}

// Zakazi dnevni podsetnik za planiranje autfita (svako vece u odredjeni sat)
export async function scheduleDailyOutfitReminder(
  hour: number = 20,
  minute: number = 0,
) {
  // Prvo obrisi eventualne stare zakazane podsetnike da ne dupliramo
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Digitalni Orman 👗",
      body: "Isplaniraj šta ćeš obući sutra!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// Otkazi sve zakazane notifikacije (npr. ako korisnik iskljuci podsetnike)
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
