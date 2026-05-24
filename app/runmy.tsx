import { supabase } from "@/services/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function Run() {
  const [runs, setRuns] = React.useState<any[]>([]);

  // ฟังก์ชั่นดึงข้อมูลจาก Supabase
  const fetchRuns = async () => {
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setRuns(data || []);
  };

  // โหลดข้อมูลทุกครั้งที่เข้าหน้านี้
  useFocusEffect(
    React.useCallback(() => {
      fetchRuns();
    }, []),
  );

  return (
    <View style={styles.container}>
      {/* โลโก้ */}
      <Image
        source={require("@/assets/images/runlogo.png")}
        style={styles.runlogo}
      />

      {/* แสดงรายการวิ่ง */}
      <FlatList
        data={runs}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.runImage} />

            <Text style={styles.title}>{item.location}</Text>

            <Text style={styles.detail}>ระยะทาง: {item.distance} กม.</Text>

            <Text style={styles.detail}>ช่วงเวลา: {item.time_of_day}</Text>

            <Text style={styles.detail}>วันที่: {item.run_date}</Text>
          </View>
        )}
      />

      {/* ปุ่มเพิ่มข้อมูล */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  runlogo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  runImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  detail: {
    fontSize: 14,
    marginBottom: 3,
  },

  addBtn: {
    position: "absolute",
    bottom: 80,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: "#34c9ad",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
