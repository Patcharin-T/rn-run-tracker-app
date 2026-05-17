import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Addtmp() {
  //สร้าง State เพื่อจัดการกับข้อมูลบน Component ที่จะทำงานด้วย
  const [location, setLocation] = React.useState("");
  const [distance, setDistance] = React.useState("");
  const [timeOfDay, setTimeOfDay] = React.useState("");
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [base64Image, setBase64Image] = React.useState<string | null>(null);

  // ฟังก์ชั่นเปิดกล้องและถ่ายภาพ
  const takePhoto = async () => {
    //ขออนุญาตเข้าถึงกล้อง
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ขออนุญาตเข้าถึงกล้องเพื่อถ่ายภาพหน่อยนะคร๊าบบบบบ");
      return;
    }

    //เปิดกล้องเพื่อถ่ายภาพ
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    //หลักจากถ่ายเรียยบร้อยแล้ว เอาไปกับ state ที่เตรียมไว้
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
    }
  };

  // ฟังก์ชั่นอัปโหลดรูปและบันทึกข้อมูลไปยัง Supabase
  const uploadAndSaveData = async () => {
    // Validate UI ป้อนครบมั้ย? ถ่ายรูปมั้ย?
    if (!location || !distance || !base64Image) {
      Alert.alert("กรุณาป้อนข้อมูลให้ครบถ้วนและถ่ายรูปภาพ");
      return;
    }

    // Upload ไปยัง Supabase Storage
    //สร้างชื่อรูปภาพที่จะอัปโหลด เพื่อให้ไฟล์ไม่ซ้ำกัน
    const fileName = `run_${Date.now()}.jpg`;

    //แปลง Base64 เป็น BinaryData (แปลงเป็นตัวรูป) เพื่ออัปโหลด
    const byteCharacters = atob(base64Image);
    const byteNumber = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumber[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumber);

    //อัปโหลดรูป
    const { error: uploadError } = await supabase.storage
      .from("run_bk")
      .upload(fileName, byteArray, {
        contentType: "image/jpeg",
      });

    // ตรงขสอบว่าโหลดสำเร็จมั้ย
    if (uploadError) {
      Alert.alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:" + uploadError.message);
      return;
    }

    // เอาค่าที่อยู่ของรูปที่เก็บในตัวแปรเพื่อใช้บันทึกลง Database
    let image_url = supabase.storage.from("run_bk").getPublicUrl(fileName)
      .data.publicUrl;

    // บันทึกข้อมูลทั้งหมดของลง supabase Database
    const { error: dbError } = await supabase.from("runs").insert({
      location: location,
      distance: parseFloat(distance),
      time_of_day: timeOfDay,
      run_date: new Date().toISOString().split("T")[0],
      image_url: image_url,
    });

    // แสดง Alert แจ้งว่าบันทึกสำเร็จ และกลับไปหน้า /run
    Alert.alert("บันทึกข้อมูลสำเร็จ");
    router.back();
  };

  //--------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
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

        {/* เลือกช่วงเวลา */}
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

        {/* ปุ่มเปิดกล้องถ่ายภาพ */}
        <Text style={styles.titleShow}>รูปภาพสถานที่</Text>
        <TouchableOpacity style={styles.takePhotoBtn} onPress={takePhoto}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 200 }}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="camera-outline" size={30} color="#b6b6b6" />
              <Text
                style={{ fontFamily: "Kanit_400Regular", color: "#b6b6b6" }}
              >
                กดเพื่อถ่ายภาพ
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ปุ่มบันทึก */}
        <TouchableOpacity style={styles.saveBtn} onPress={uploadAndSaveData}>
          <Text style={{ fontFamily: "Kanit_700Bold", color: "#fff" }}>
            บันทึกข้อมูล
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  todBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  saveBtn: {
    padding: 15,
    backgroundColor: "#34c9ad",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  takePhotoBtn: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
});
