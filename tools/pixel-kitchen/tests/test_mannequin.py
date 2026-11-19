import json
import unittest
from PIL import Image
from mannequin import LIBRARY, validate


class HumanMannequinTest(unittest.TestCase):
    def test_masters(self):
        rig = json.loads((LIBRARY / "mannequin-rig.json").read_text())
        for view, pose in rig["views"].items():
            with self.subTest(view=view):
                image = Image.open(LIBRARY / (view + ".png"))
                validate(image, pose["joints"], pose)
                self.assertEqual(image.getbbox()[1::2], (10, 62))
                self.assertEqual(image.crop((0, 10, 64, 31)).getbbox(), (21, 0, 43, 21))
                self.assertEqual({pixel for _, pixel in image.getcolors() if pixel[3]},
                                 {(value,value,value,255) for value in (0,142,178,211)})
                for x,y in pose["joints"]["eyes"]:
                    for row in (y,y+1):
                        self.assertEqual(image.getpixel((x,row))[:3] == (0,0,0), view != "back")
                marked = image.copy()
                for points in pose["joints"].values():
                    for xy in points:
                        marked.putpixel(tuple(xy), (0, 218, 247, 255))
                self.assertEqual(marked.tobytes(), Image.open(LIBRARY / (view + "-joints.png")).tobytes())
                joints = dict(pose["joints"], neck=[[31, 31]])
                with self.assertRaises(ValueError):
                    validate(image, joints, pose)
