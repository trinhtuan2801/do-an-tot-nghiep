import tensorflow as tf
import numpy as np
from enum import Enum


class MoveGuide(Enum):
    OK = 0
    MOVE_LEFT = 1
    MOVE_RIGHT = 2
    MOVE_CAMERA_DOWN = 3
    MOVE_AWAY = 4


class PoseDetector(object):
    def __init__(self):
        self.box = (120, 10, 400, 470)
        self.interpreter = tf.lite.Interpreter(
            model_path='lite-model_movenet_singlepose_lightning_3.tflite')
        self.interpreter.allocate_tensors()

    def check_all_in_box(self, frame, keypoints, box, update_start):
        y, x, c = frame.shape
        shaped = np.squeeze(np.multiply(keypoints, [y, x, 1]))

        body_point = [shaped[5], shaped[6], shaped[11], shaped[12]]

        th = 0.3
        if update_start is True:
            th = 0.4

        for kp in body_point:
            y, x, conf = kp
            if conf < th:
                return MoveGuide.MOVE_AWAY

        if shaped[6][1] < box[0]:
            return MoveGuide.MOVE_LEFT
        if shaped[5][1] > box[0] + box[2]:
            return MoveGuide.MOVE_RIGHT
        if shaped[0][0] > box[1] + box[3] * 2/3:
            return MoveGuide.MOVE_CAMERA_DOWN

        return MoveGuide.OK

    def getAngle(self, a, b):
        a = a/np.linalg.norm(a)
        b = b/np.linalg.norm(b)
        dot = np.dot(a, b)
        angle = np.rad2deg(np.arccos(dot))
        dot = a[0]*-b[1] + a[1]*b[0]
        if(dot > 0):
            angle = -angle
        return angle

    def readImage(self, frame):
        img = frame.copy()
        img = tf.image.resize_with_pad(np.expand_dims(img, axis=0), 192, 192)
        input_image = tf.cast(img, dtype=tf.float32)

        input_details = self.interpreter.get_input_details()
        output_details = self.interpreter.get_output_details()

        self.interpreter.set_tensor(
            input_details[0]['index'], np.array(input_image))
        self.interpreter.invoke()
        keypoints_with_scores = self.interpreter.get_tensor(
            output_details[0]['index'])

        return keypoints_with_scores[0][0]

    def predict(self, frame, update_start=True):
        keypoints = self.readImage(frame)
        mguide = self.check_all_in_box(
            frame, keypoints, self.box, update_start)

        return keypoints, mguide

