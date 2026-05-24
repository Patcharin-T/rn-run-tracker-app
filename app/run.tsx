import { supabase } from "@/services/supabase";
import { Runs } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const runimg = require("@/assets/images/runlogo.png");

export default function Run() {
  //สร้าง state เก็บข้อมูลที่ดึงมาจาก Supabase
  const [runs, setRuns] = useState<Runs[]>([]);

  //สร้างฟังก์ชันดึงข้อมูลรายการวิ่งจาก Supabase
  const fetchRuns = async () => {
    //ดึง
    const { data, error } = await supabase.from("runs").select("*");
    //ตรวจสอบ Error
    if (error) {
      Alert.alert("คำเตือน", "ไม่สามารถดึงข้อมูลรายการวิ่งได้ กรุณาลองใหม่");
      return;
    }
    //กำหนดข้อมูลที่ดึงมาให้กับ state
    setRuns(data as Runs[]);
  };

  //เรียกใช้ฟังก์ชันดึงข้อมูล (fetchRuns)
  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, []),
  );

  //สร้างฟังก์ชันแสดงหน้าตาของแต่ละรายการที่ FlatList
  const renderItem = ({ item }: { item: Runs }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        <View style={styles.distanceBadge}>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.dateText}>
            {(() => {
              const date = new Date(item.run_date);
              const buddhistYear = "พ.ศ. " + (date.getFullYear() + 543);
              return (
                new Intl.DateTimeFormat("th-TH", {
                  month: "long",
                  day: "numeric",
                }).format(date) +
                " " +
                buddhistYear
              );
            })()}
          </Text>
        </View>
        <Text style={styles.distanceText}>{item.distanc} km</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ส่วนแสดงรูปด้านบนสุด */}
      <Image source={runimg} style={styles.imglogo} />

      {/* ส่วนแสดงข้อมูลรายการวิ่งที่ดึงมาจาก Supabase */}
      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
      />

      {/* ส่วนแสดงปุ่มเปิดไปหน้า /add */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  listPadding: {
    padding: 20,
    paddingBottom: 100, // เว้นที่ให้ FAB
  },
  distanceText: {
    fontFamily: "Kanit_700Bold",
    fontSize: 14,
    color: "#34c9ad",
  },
  dateText: {
    fontFamily: "Kanit_400Regular",
    fontSize: 14,
    color: "#888",
  },
  locationText: {
    fontFamily: "Kanit_700Bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 4,
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    // Shadow สำหรับ iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation สำหรับ Android
    elevation: 3,
  },
  imgShow: {
    width: 50,
    height: 50,
  },
  cardItem: {
    flex: 1,
    flexDirection: "row",
    margin: 5,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  imglogo: {
    width: 120,
    height: 120,
    marginTop: 40,
    margin: "auto",
  },
  floatingBtn: {
    padding: 10,
    backgroundColor: "#34c9ad",
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 60,
    right: 40,
    elevation: 3,
  },
  container: {
    flex: 1,
  },
});
