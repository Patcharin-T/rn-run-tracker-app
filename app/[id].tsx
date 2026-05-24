import { supabase } from "@/services/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RunDetail() {
  // ตัวแปรเก็บข้อมูลพารามิเตอร์ที่ส่งมาจากหน้า Run คือ id ของรายการวิ่งที่ส่งมา
  const { id } = useLocalSearchParams();

  // สร้าง State เพื่อเก็บข้อมูลรายละเอียดของรายการวิ่งที่ดึงมาจาก Supabase
  // เพื่อเอาไปใช้กับ component ที่จะแสดงบน UI เพื่อแก้ไข หรือลบทิ้งไป
  const [location, setLocation] = React.useState("");
  const [distance, setDistance] = React.useState("");
  const [timeOfDay, setTimeOfDay] = React.useState("เช้า");
  const [imageUri, setImageUri] = React.useState(""); //สำหรับใช้แสดงบน UI

  // ดึงข้อมูลรายละเอียดของรายการวิ่งจาก Supabase โดยใช้ id ที่ได้จากพารามิเตอร์
  useEffect(() => {
    //ฟังก์ชั่นดึงข้อมูลจาก Supabase และกำหนดค่าที่ดึงมาให้กับ State ที่เตรียมไว้
    const fatchRunDetail = async () => {
      //ดึงข้อมูลจาก Supabase โดยใช้ id ที่ได้จากพารามิเตอร์
      const { data, error } = await supabase
        .from("runs")
        .select("*")
        .eq("id", id)
        .single();

      //ตรวจสอบerror
      if (error) {
        Alert.alert(
          "คำเตือน",
          "ไม่สามารถดึงข้อมูลรายละเอียดรายการวิ่งได้ กรุณาลองใหม่อีกครั้ง",
        );
        return;
      }

      //กำหนดค่าที่ดึงมาให้กับ State
      if (data) {
        setLocation(data.location);
        setDistance(data.distance.toString());
        setTimeOfDay(data.time_of_day);
        setImageUri(data.image_url);
      }
    };

    //เรียกใช้ดึงข้อมูล
    fatchRunDetail();
  }, []);

  // ฟังก์ชั่นอัปเดตข้อมูลรายการวิ่งใน Supabase
  const handleUpdateRun = async () => {
    // Validate UI
    if (!location || !distance) {
      Alert.alert("คำเตือน", "กรุณาป้อนข้อมูลให้ครบถ้วน");
      return;
    }
    // บันทึกแก้ไขไปยัง Supabase
    const { error } = await supabase
      .from("runs")
      .update({
        location,
        distance: parseFloat(distance),
        time_of_day: timeOfDay,
      })
      .eq("id", id);

    // ตรวจสอบ error
    if (error) {
      Alert.alert("คำเตือน", "ไม่สามารถบันทึกการแก้ไขได้ กรุณาลองใหม่อีกครั้ง");
      return;
    }
    // แสดงข้อความแจ้งผลการบันทึกแก้ไข
    (Alert.alert("ผลการทำงาน", "บันทึกการแก้ไขเรียบร้อย"),
      // ย้อนกลับไปหน้า /run เพื่อแสดงขอมูลล่าสุดจาก Supabase
      router.back());
  };

  // ฟังก์ชั่นสำหรับลบรายการวิ่งใน Supabase
  const handleDeleteRun = async () => {
    // แสดง Alert เพื่อยืนยีนการลบรายการวิ่ง

    // และลบรายการวิ่งใน Supabase หากผู้ใช้ยืนยันลบ
    Alert.alert(
      "ยืนยันการลบ",
      "คุณแน่ในหรือไม่ว่าต้องการลบรายการวิ่งนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยันการลบ",
          style: "destructive",
          onPress: async () => {
            //ลบรายการวิ่งใน Supabase
            const { error } = await supabase.from("runs").delete().eq("id", id);
            //ตรวจสอบ Error
            if (error) {
              Alert.alert(
                "คำเตือน",
                "ไม่สามารถลบรายการวิ่งได้ กรุณาลองใหม่อีกครั้ง",
              );
              return;
            }
            //ลบรูปออกจาก Supabase Storage
            const { error: deleteImageError } = await supabase.storage
              .from("run_bk")
              .remove([imageUri.split("/").pop() || ""]);
            // ตรวจสอบ Error ลบรูปภาพ
            if (deleteImageError) {
              Alert.alert(
                "คำเตือน",
                "ไม่สามารถลบรูปภาพได้ กรุณาลองใหม่อีกครั้ง",
              );
              return;
            }
            //แสดงผลการทำงาน
            Alert.alert("ผลการทำงาน", "ลบรายการวิ่งเรียบร้อยแล้ว");

            //ย้อนกลับไปหน้า /run เพื่อสแดงผลข้อมูลล่าสุด
            router.back();
          },
        },
      ],
    );
  };
  return (
    <ScrollView style={styles.container}>
      {/* ส่วนแสดงรูปภาพ */}
      <Image
        source={{ uri: imageUri }}
        style={styles.imgRun}
        resizeMode="cover"
      />

      {/* ส่วนแสดงรายละเอียดการวิ่ง เพื่อให้ผู้ใช้ดูและแก้ไข */}
      <View style={styles.detilaeContainer}>
        {/* ป้อนสถานที่วิ่ง */}
        <Text style={styles.titleShow}>สถานที่วิ่ง</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="เช่น สวนลุมพินี"
          style={styles.inputValue}
        />

        {/* ป้อนระยะทาง */}
        <Text style={styles.titleShow}>ระยะทาง (กิโลเมตร)</Text>
        <TextInput
          value={distance}
          onChangeText={setDistance}
          placeholder="เช่น 5.2"
          keyboardType="numeric"
          style={styles.inputValue}
        />
        <Text style={styles.titleShow}>ช่วงเวลา</Text>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <TouchableOpacity
            style={[
              styles.todBtn,
              { backgroundColor: timeOfDay === "เช้า" ? "#34c9ad" : "#a9a9a9" },
            ]}
            onPress={() => setTimeOfDay("เช้า")}
          >
            <Text style={{ fontFamily: "Kanit_400Regular", color: "#717171" }}>
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.todBtn,
              { backgroundColor: timeOfDay === "เย็น" ? "#34c9ad" : "#a9a9a9" },
            ]}
            onPress={() => setTimeOfDay("เย็น")}
          >
            <Text style={{ fontFamily: "Kanit_400Regular", color: "#717171" }}>
              เย็น
            </Text>
          </TouchableOpacity>
        </View>

        {/*ปุ่มบันทึกแก้ไข */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateRun}>
          <Text style={{ fontFamily: "Kanit_700Bold", color: "#fff" }}>
            บันทึกการแก้ไข
          </Text>
        </TouchableOpacity>
        {/* ปุ่มลบ */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteRun}>
          <Ionicons name="trash-bin" size={24} color="#ff0000" />
          <Text style={{ fontFamily: "Kanit_400Regular", color: "#ff0000" }}>
            ลบรายการนี้
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  deleteBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  saveBtn: {
    padding: 15,
    backgroundColor: "#34c9ad",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  todBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  inputValue: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontFamily: "Kanit_400Regular",
    backgroundColor: "#EFEFEF",
  },
  titleShow: {
    fontFamily: "Kanit_700Bold",
    marginBottom: 10,
  },
  detilaeContainer: {
    backgroundColor: "#ffff",
    height: "100%",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
  },
  container: {
    flex: 1,
  },
  imgRun: {
    width: "100%",
    height: 250,
  },
});
