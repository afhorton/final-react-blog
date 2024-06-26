import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc, Timestamp} from 'firebase/firestore';
import app from './firebase-config';

const db = getFirestore(app);

// Fetch published stories
export const fetchPublishedStories = createAsyncThunk(
    'publishedStories/fetchPublishedStories', async () => {
        const querySnapshot = await getDocs(collection(db, 'publishedStories'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(),
            createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
            updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toDate().toISOString() : doc.data().updatedAt,
        }));
    }
);

export const unpublishStory = createAsyncThunk('publishedStories/unpublishStory', async (storyId) => {
    await deleteDoc(doc(db, 'publishedStories', storyId));
    return storyId;
});

// Publish a story
export const publishStory = createAsyncThunk(
    "publishedStories/publishStory",
    async (story) => {
      await setDoc(doc(db, "publishedStories", story.id), story);
      return story;
    },
  );

export const fetchPublishedStory = createAsyncThunk('publishedStories/fetchPublishedStory', async (storyId) => {
    const docRef = doc(db, 'publishedStories', storyId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error('No such document!');
    }
});

const publishedStoriesSlice = createSlice({
    name: 'publishedStories',
    initialState: [],
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchPublishedStories.fulfilled, (state, action) =>{
            state.length = 0;
            action.payload.forEach(
                story => {state.push({
                    ...story,
                    createdAt: story.createdAt instanceof Timestamp ? story.createdAt.toDate().toISOString() : story.createdAt,
                    updatedAt: story.updatedAt instanceof Timestamp ? story.updatedAt.toDate().toISOString() : story.updatedAt,
                })
        });
        })
        .addCase(publishStory.fulfilled, (state, action) => {
            state.push(action.payload);
        })
        .addCase(unpublishStory.fulfilled, (state, action) => {
            const newState = state.filter(story => story.id !== action.payload);
            state.splice(0, state.length, ...newState);
        });
    },
});

export default publishedStoriesSlice.reducer;